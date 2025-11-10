#!/bin/bash

################################################################################
# MongoDB Server Setup Script for SmartMess
# This script sets up a production-ready MongoDB server on a separate VPS
# 
# Usage: 
#   chmod +x setup-mongodb-server.sh
#   ./setup-mongodb-server.sh
#
# Requirements:
#   - Ubuntu 22.04 LTS
#   - Root or sudo access
#   - Separate server from application
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "════════════════════════════════════════════════════════════════"
echo "         MongoDB Production Setup for SmartMess"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root or with sudo"
    exit 1
fi

# Get configuration
log_info "Please provide the following information:"
echo ""
read -p "Enter admin username for MongoDB [admin]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}
read -sp "Enter admin password for MongoDB: " ADMIN_PASS
echo ""
read -p "Enter application username [smartmess_app]: " APP_USER
APP_USER=${APP_USER:-smartmess_app}
read -sp "Enter application password: " APP_PASS
echo ""
read -p "Enter database name [SmartMess]: " DB_NAME
DB_NAME=${DB_NAME:-SmartMess}
read -p "Enter application server IP (for firewall): " APP_SERVER_IP
echo ""

################################################################################
# Step 1: Update System
################################################################################
log_info "Step 1: Updating system..."
apt update && apt upgrade -y
log_success "System updated"

################################################################################
# Step 2: Install MongoDB 6.0
################################################################################
log_info "Step 2: Installing MongoDB 6.0..."

# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
apt update

# Install MongoDB
apt install -y mongodb-org

# Hold MongoDB packages to prevent accidental upgrades
apt-mark hold mongodb-org mongodb-org-database mongodb-org-server mongodb-org-mongos mongodb-org-tools

log_success "MongoDB installed"

################################################################################
# Step 3: Configure MongoDB
################################################################################
log_info "Step 3: Configuring MongoDB..."

# Get system memory for cache size calculation
TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
CACHE_SIZE=$((TOTAL_MEM / 2))

# Backup original config
cp /etc/mongod.conf /etc/mongod.conf.backup

# Create new configuration
cat > /etc/mongod.conf <<EOF
# MongoDB Configuration File

# Storage settings
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: $CACHE_SIZE
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

# System log settings
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen
  timeStampFormat: iso8601-utc

# Network settings
net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 1000

# Security settings
security:
  authorization: enabled

# Process management
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid
  timeZoneInfo: /usr/share/zoneinfo

# Operation profiling (for debugging slow queries)
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

# Replication (optional - configure if you want replica sets)
# replication:
#   replSetName: "rs0"

# Set parameter (performance tuning)
setParameter:
  enableLocalhostAuthBypass: false
EOF

log_success "MongoDB configured"

################################################################################
# Step 4: Start MongoDB
################################################################################
log_info "Step 4: Starting MongoDB..."

systemctl daemon-reload
systemctl enable mongod
systemctl start mongod

# Wait for MongoDB to start
sleep 5

# Check if MongoDB is running
if systemctl is-active --quiet mongod; then
    log_success "MongoDB is running"
else
    log_error "MongoDB failed to start"
    journalctl -u mongod -n 50
    exit 1
fi

################################################################################
# Step 5: Create Admin User
################################################################################
log_info "Step 5: Creating admin user..."

mongosh --eval "
db = db.getSiblingDB('admin');
db.createUser({
  user: '$ADMIN_USER',
  pwd: '$ADMIN_PASS',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' },
    { role: 'dbAdminAnyDatabase', db: 'admin' },
    { role: 'clusterAdmin', db: 'admin' }
  ]
});
print('Admin user created successfully');
"

log_success "Admin user created"

################################################################################
# Step 6: Create Application User
################################################################################
log_info "Step 6: Creating application user..."

mongosh -u $ADMIN_USER -p $ADMIN_PASS --authenticationDatabase admin --eval "
db = db.getSiblingDB('$DB_NAME');
db.createUser({
  user: '$APP_USER',
  pwd: '$APP_PASS',
  roles: [
    { role: 'readWrite', db: '$DB_NAME' },
    { role: 'dbAdmin', db: '$DB_NAME' }
  ]
});
print('Application user created successfully');
"

log_success "Application user created"

################################################################################
# Step 7: Restart MongoDB with Authentication
################################################################################
log_info "Step 7: Restarting MongoDB with authentication..."
systemctl restart mongod
sleep 3
log_success "MongoDB restarted"

################################################################################
# Step 8: Configure Firewall
################################################################################
log_info "Step 8: Configuring firewall..."

apt install -y ufw

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow ssh

# Allow MongoDB only from application server
ufw allow from $APP_SERVER_IP to any port 27017

# Enable firewall
ufw --force enable

log_success "Firewall configured"

################################################################################
# Step 9: Optimize System Settings
################################################################################
log_info "Step 9: Optimizing system settings..."

# Disable Transparent Huge Pages (THP)
cat > /etc/systemd/system/disable-transparent-huge-pages.service <<EOF
[Unit]
Description=Disable Transparent Huge Pages (THP)
DefaultDependencies=no
After=sysinit.target local-fs.target
Before=mongod.service

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never | tee /sys/kernel/mm/transparent_hugepage/enabled > /dev/null'
ExecStart=/bin/sh -c 'echo never | tee /sys/kernel/mm/transparent_hugepage/defrag > /dev/null'

[Install]
WantedBy=basic.target
EOF

systemctl daemon-reload
systemctl enable disable-transparent-huge-pages
systemctl start disable-transparent-huge-pages

# Set ulimit for MongoDB
cat >> /etc/security/limits.conf <<EOF

# MongoDB ulimits
mongodb soft nofile 64000
mongodb hard nofile 64000
mongodb soft nproc 64000
mongodb hard nproc 64000
EOF

log_success "System optimized"

################################################################################
# Step 10: Setup Monitoring Script
################################################################################
log_info "Step 10: Creating monitoring script..."

mkdir -p /root/scripts

cat > /root/scripts/mongodb-monitor.sh <<'MONITOR_EOF'
#!/bin/bash

ADMIN_USER="ADMIN_USER_PLACEHOLDER"
ADMIN_PASS="ADMIN_PASS_PLACEHOLDER"

echo "════════════════════════════════════════════════════════════════"
echo "MongoDB Status Report - $(date)"
echo "════════════════════════════════════════════════════════════════"

# Server status
echo -e "\n[Server Status]"
mongosh -u $ADMIN_USER -p $ADMIN_PASS --authenticationDatabase admin --quiet --eval "
  var status = db.serverStatus();
  print('Uptime: ' + Math.floor(status.uptime / 3600) + ' hours');
  print('Connections: ' + status.connections.current + '/' + status.connections.available);
  print('Active ops: ' + status.opcounters.query + ' queries, ' + status.opcounters.insert + ' inserts');
"

# Database sizes
echo -e "\n[Database Sizes]"
mongosh -u $ADMIN_USER -p $ADMIN_PASS --authenticationDatabase admin --quiet --eval "
  db.adminCommand('listDatabases').databases.forEach(function(d) {
    print(d.name + ': ' + (d.sizeOnDisk / 1024 / 1024 / 1024).toFixed(2) + ' GB');
  });
"

# System resources
echo -e "\n[System Resources]"
echo "Memory:"
free -h | grep Mem
echo -e "\nDisk:"
df -h | grep -E '(Filesystem|/dev/)'
echo -e "\nCPU Load:"
uptime

echo "════════════════════════════════════════════════════════════════"
MONITOR_EOF

sed -i "s|ADMIN_USER_PLACEHOLDER|$ADMIN_USER|g" /root/scripts/mongodb-monitor.sh
sed -i "s|ADMIN_PASS_PLACEHOLDER|$ADMIN_PASS|g" /root/scripts/mongodb-monitor.sh

chmod +x /root/scripts/mongodb-monitor.sh

log_success "Monitoring script created"

################################################################################
# Step 11: Setup Backup Script
################################################################################
log_info "Step 11: Creating backup script..."

cat > /root/scripts/mongodb-backup.sh <<'BACKUP_EOF'
#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
ADMIN_USER="ADMIN_USER_PLACEHOLDER"
ADMIN_PASS="ADMIN_PASS_PLACEHOLDER"
DB_NAME="DB_NAME_PLACEHOLDER"

mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup at $(date)"

# Create backup
mongodump \
  --uri="mongodb://$ADMIN_USER:$ADMIN_PASS@localhost:27017/$DB_NAME" \
  --authenticationDatabase=admin \
  --out="$BACKUP_DIR/backup_$TIMESTAMP"

# Compress
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
rm -rf "$BACKUP_DIR/backup_$TIMESTAMP"

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.tar.gz"
echo "Size: $(du -h $BACKUP_DIR/backup_$TIMESTAMP.tar.gz | cut -f1)"
BACKUP_EOF

sed -i "s|ADMIN_USER_PLACEHOLDER|$ADMIN_USER|g" /root/scripts/mongodb-backup.sh
sed -i "s|ADMIN_PASS_PLACEHOLDER|$ADMIN_PASS|g" /root/scripts/mongodb-backup.sh
sed -i "s|DB_NAME_PLACEHOLDER|$DB_NAME|g" /root/scripts/mongodb-backup.sh

chmod +x /root/scripts/mongodb-backup.sh

# Schedule backup (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/scripts/mongodb-backup.sh >> /var/log/mongodb-backup.log 2>&1") | crontab -

log_success "Backup script created and scheduled"

################################################################################
# Step 12: Create Indexes Script
################################################################################
log_info "Step 12: Creating indexes optimization script..."

cat > /root/scripts/create-indexes.sh <<'INDEX_EOF'
#!/bin/bash

ADMIN_USER="ADMIN_USER_PLACEHOLDER"
ADMIN_PASS="ADMIN_PASS_PLACEHOLDER"
DB_NAME="DB_NAME_PLACEHOLDER"

echo "Creating MongoDB indexes for SmartMess..."

mongosh -u $ADMIN_USER -p $ADMIN_PASS --authenticationDatabase admin --eval "
use $DB_NAME;

// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1, isActive: 1 });

// MessProfiles collection
db.messprofiles.createIndex({ ownerId: 1 });
db.messprofiles.createIndex({ isVerified: 1, isActive: 1 });
db.messprofiles.createIndex({ location: '2dsphere' });

// MessMemberships collection
db.messmemberships.createIndex({ userId: 1, messId: 1 });
db.messmemberships.createIndex({ messId: 1, status: 1 });
db.messmemberships.createIndex({ messId: 1, status: 1, endDate: 1 });
db.messmemberships.createIndex({ userId: 1, status: 1 });
db.messmemberships.createIndex({ endDate: 1 });

// Billings collection
db.billings.createIndex({ userId: 1, dueDate: 1 });
db.billings.createIndex({ messId: 1, status: 1 });
db.billings.createIndex({ userId: 1, messId: 1, month: 1, year: 1 });
db.billings.createIndex({ status: 1, dueDate: 1 });

// Notifications collection
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, type: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// ChatMessages collection
db.chatmessages.createIndex({ roomId: 1, createdAt: -1 });
db.chatmessages.createIndex({ senderId: 1, createdAt: -1 });
db.chatmessages.createIndex({ roomId: 1, isDeleted: 1, createdAt: -1 });

// ChatRooms collection
db.chatrooms.createIndex({ messId: 1 });
db.chatrooms.createIndex({ 'members.userId': 1 });
db.chatrooms.createIndex({ type: 1, isActive: 1 });

// MealPlans collection
db.mealplans.createIndex({ messId: 1, date: 1 });
db.mealplans.createIndex({ messId: 1, mealType: 1, date: -1 });

// Transactions collection
db.transactions.createIndex({ userId: 1, createdAt: -1 });
db.transactions.createIndex({ messId: 1, status: 1 });
db.transactions.createIndex({ transactionId: 1 }, { unique: true });
db.transactions.createIndex({ status: 1, createdAt: -1 });

// OTPs collection (with TTL)
db.otps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 }); // 10 minutes TTL
db.otps.createIndex({ email: 1, type: 1 });

print('✅ Indexes created successfully');
"
INDEX_EOF

sed -i "s|ADMIN_USER_PLACEHOLDER|$ADMIN_USER|g" /root/scripts/create-indexes.sh
sed -i "s|ADMIN_PASS_PLACEHOLDER|$ADMIN_PASS|g" /root/scripts/create-indexes.sh
sed -i "s|DB_NAME_PLACEHOLDER|$DB_NAME|g" /root/scripts/create-indexes.sh

chmod +x /root/scripts/create-indexes.sh

# Run it now
log_info "Creating initial indexes..."
/root/scripts/create-indexes.sh

log_success "Indexes created"

################################################################################
# Step 13: Setup Log Rotation
################################################################################
log_info "Step 13: Configuring log rotation..."

cat > /etc/logrotate.d/mongodb <<EOF
/var/log/mongodb/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 mongodb mongodb
    sharedscripts
    postrotate
        /bin/kill -SIGUSR1 \$(cat /var/run/mongodb/mongod.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF

log_success "Log rotation configured"

################################################################################
# Step 14: Security Hardening
################################################################################
log_info "Step 14: Applying security hardening..."

# Install fail2ban
apt install -y fail2ban

# Configure fail2ban for MongoDB
cat > /etc/fail2ban/jail.d/mongodb.conf <<EOF
[mongodb-auth]
enabled = true
filter = mongodb-auth
logpath = /var/log/mongodb/mongod.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

cat > /etc/fail2ban/filter.d/mongodb-auth.conf <<EOF
[Definition]
failregex = .*Authentication failed.*<HOST>
ignoreregex =
EOF

systemctl enable fail2ban
systemctl restart fail2ban

log_success "Security hardening applied"

################################################################################
# Final Report
################################################################################
echo ""
echo "════════════════════════════════════════════════════════════════"
log_success "MONGODB SERVER SETUP COMPLETED!"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "MongoDB Connection Details:"
echo ""
echo "Host: $(hostname -I | awk '{print $1}')"
echo "Port: 27017"
echo "Database: $DB_NAME"
echo "Application User: $APP_USER"
echo "Application Password: $APP_PASS"
echo ""
echo "Connection String:"
echo "mongodb://$APP_USER:$APP_PASS@$(hostname -I | awk '{print $1}'):27017/$DB_NAME"
echo ""
log_info "Useful Commands:"
echo ""
echo "1. Check MongoDB status:"
echo "   systemctl status mongod"
echo ""
echo "2. View MongoDB logs:"
echo "   tail -f /var/log/mongodb/mongod.log"
echo ""
echo "3. Connect to MongoDB:"
echo "   mongosh -u $ADMIN_USER -p --authenticationDatabase admin"
echo ""
echo "4. Monitor MongoDB:"
echo "   /root/scripts/mongodb-monitor.sh"
echo ""
echo "5. Manual backup:"
echo "   /root/scripts/mongodb-backup.sh"
echo ""
echo "6. View indexes:"
echo "   mongosh -u $ADMIN_USER -p --authenticationDatabase admin --eval 'use $DB_NAME; db.getCollectionNames().forEach(c => { print(c); printjson(db[c].getIndexes()); })'"
echo ""
log_warning "IMPORTANT:"
echo "1. Save the connection string securely"
echo "2. Update your application's .env file with this connection string"
echo "3. Test the connection from your application server"
echo "4. Monitor system resources regularly"
echo "5. Backups are scheduled daily at 2 AM"
echo ""
log_info "Firewall Configuration:"
echo "MongoDB is accessible only from: $APP_SERVER_IP"
echo "To allow additional IPs:"
echo "ufw allow from NEW_IP to any port 27017"
echo ""
echo "════════════════════════════════════════════════════════════════"






