#!/bin/bash

################################################################################
# SmartMess VPS Deployment Script
# This script automates the deployment of SmartMess to a fresh VPS
# 
# Usage: 
#   chmod +x deploy-to-vps.sh
#   ./deploy-to-vps.sh
#
# Requirements:
#   - Ubuntu 22.04 LTS
#   - Root or sudo access
#   - Domain name pointed to your server
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Banner
echo "════════════════════════════════════════════════════════════════"
echo "         SmartMess Production Deployment Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root or with sudo"
    exit 1
fi

# Get configuration
read -p "Enter your domain name (e.g., smartmess.com): " DOMAIN
read -p "Enter your email for SSL certificate: " EMAIL
read -p "Enter MongoDB server IP (or localhost if same server): " MONGODB_HOST
read -sp "Enter MongoDB password for smartmess_app user: " MONGODB_PASS
echo ""
read -p "Enter your GitHub repository URL: " GIT_REPO
read -p "Enter deployment directory path [/var/www/smartmess]: " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-/var/www/smartmess}

log_info "Starting deployment process..."
echo ""

################################################################################
# Step 1: System Update
################################################################################
log_info "Step 1: Updating system packages..."
apt update && apt upgrade -y
log_success "System updated"

################################################################################
# Step 2: Install Node.js 18
################################################################################
log_info "Step 2: Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
npm --version
log_success "Node.js installed"

################################################################################
# Step 3: Install PM2
################################################################################
log_info "Step 3: Installing PM2..."
npm install -g pm2
pm2 --version
log_success "PM2 installed"

################################################################################
# Step 4: Install MongoDB Client Tools
################################################################################
log_info "Step 4: Installing MongoDB tools..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-mongosh mongodb-database-tools
log_success "MongoDB tools installed"

################################################################################
# Step 5: Install Nginx
################################################################################
log_info "Step 5: Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
log_success "Nginx installed and started"

################################################################################
# Step 6: Install Certbot for SSL
################################################################################
log_info "Step 6: Installing Certbot..."
apt install -y certbot python3-certbot-nginx
log_success "Certbot installed"

################################################################################
# Step 7: Install Git
################################################################################
log_info "Step 7: Installing Git..."
apt install -y git
log_success "Git installed"

################################################################################
# Step 8: Setup Firewall
################################################################################
log_info "Step 8: Configuring firewall..."
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
log_success "Firewall configured"

################################################################################
# Step 9: Install Fail2Ban (Security)
################################################################################
log_info "Step 9: Installing Fail2Ban..."
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
log_success "Fail2Ban installed"

################################################################################
# Step 10: Create deployment directory and clone repository
################################################################################
log_info "Step 10: Setting up application..."
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

if [ ! -d ".git" ]; then
    log_info "Cloning repository..."
    git clone $GIT_REPO .
else
    log_info "Repository already exists, pulling latest..."
    git pull origin main || git pull origin master
fi

log_success "Application code ready"

################################################################################
# Step 11: Install dependencies
################################################################################
log_info "Step 11: Installing dependencies..."

# Backend
cd $DEPLOY_DIR/backend
npm ci --only=production
log_success "Backend dependencies installed"

# Frontend
cd $DEPLOY_DIR
npm ci --only=production
log_success "Frontend dependencies installed"

################################################################################
# Step 12: Build application
################################################################################
log_info "Step 12: Building application..."

# Build backend
cd $DEPLOY_DIR/backend
npm run build
log_success "Backend built"

# Build frontend
cd $DEPLOY_DIR
npm run build
log_success "Frontend built"

################################################################################
# Step 13: Create environment file
################################################################################
log_info "Step 13: Creating environment configuration..."

cat > $DEPLOY_DIR/backend/.env <<EOL
# Application
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=https://$DOMAIN

# Database
MONGODB_URI=mongodb://smartmess_app:$MONGODB_PASS@$MONGODB_HOST:27017/SmartMess
DB_CONNECTION_TIMEOUT=30000
DB_MAX_POOL_SIZE=20

# JWT - CHANGE THESE IN PRODUCTION!
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Email - UPDATE WITH YOUR DETAILS
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=SmartMess

# Cloudinary - UPDATE WITH YOUR DETAILS
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=$DEPLOY_DIR/backend/uploads

# Logging
LOG_LEVEL=info
LOG_FILE=$DEPLOY_DIR/backend/logs/app.log

# Security
CORS_ORIGINS=https://$DOMAIN
SESSION_SECRET=$(openssl rand -hex 32)

# OTP
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
EOL

log_warning "Environment file created. Please update email and Cloudinary credentials!"
log_success "Environment configured"

################################################################################
# Step 14: Create necessary directories
################################################################################
log_info "Step 14: Creating necessary directories..."
mkdir -p $DEPLOY_DIR/backend/logs
mkdir -p $DEPLOY_DIR/backend/uploads
mkdir -p $DEPLOY_DIR/backups

# Set permissions
chown -R www-data:www-data $DEPLOY_DIR
chmod -R 755 $DEPLOY_DIR
log_success "Directories created"

################################################################################
# Step 15: Configure PM2
################################################################################
log_info "Step 15: Configuring PM2..."

cd $DEPLOY_DIR/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root

log_success "PM2 configured and application started"

################################################################################
# Step 16: Configure Nginx
################################################################################
log_info "Step 16: Configuring Nginx..."

cat > /etc/nginx/sites-available/smartmess <<'NGINX_EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# WebSocket upgrade
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    root DEPLOY_DIR_PLACEHOLDER/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api {
        limit_req zone=api_limit burst=50 nodelay;
        limit_conn conn_limit 50;

        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_buffering off;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        proxy_read_timeout 86400;
    }

    # Uploads
    location /uploads {
        alias DEPLOY_DIR_PLACEHOLDER/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
NGINX_EOF

# Replace placeholders
sed -i "s|DOMAIN_PLACEHOLDER|$DOMAIN|g" /etc/nginx/sites-available/smartmess
sed -i "s|DEPLOY_DIR_PLACEHOLDER|$DEPLOY_DIR|g" /etc/nginx/sites-available/smartmess

# Enable site
ln -sf /etc/nginx/sites-available/smartmess /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

log_success "Nginx configured"

################################################################################
# Step 17: Get SSL Certificate
################################################################################
log_info "Step 17: Obtaining SSL certificate..."

certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

log_success "SSL certificate obtained"

################################################################################
# Step 18: Setup Log Rotation
################################################################################
log_info "Step 18: Configuring log rotation..."

cat > /etc/logrotate.d/smartmess <<'LOGROTATE_EOF'
DEPLOY_DIR_PLACEHOLDER/backend/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
LOGROTATE_EOF

sed -i "s|DEPLOY_DIR_PLACEHOLDER|$DEPLOY_DIR|g" /etc/logrotate.d/smartmess

log_success "Log rotation configured"

################################################################################
# Step 19: Create Backup Script
################################################################################
log_info "Step 19: Creating backup script..."

cat > $DEPLOY_DIR/backup.sh <<'BACKUP_EOF'
#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="DEPLOY_DIR_PLACEHOLDER/backups"
MONGODB_HOST="MONGODB_HOST_PLACEHOLDER"
MONGODB_PASS="MONGODB_PASS_PLACEHOLDER"

mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="mongodb://smartmess_app:$MONGODB_PASS@$MONGODB_HOST:27017/SmartMess" \
  --out="$BACKUP_DIR/backup_$TIMESTAMP"

# Compress
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" "$BACKUP_DIR/backup_$TIMESTAMP"
rm -rf "$BACKUP_DIR/backup_$TIMESTAMP"

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.tar.gz"
BACKUP_EOF

sed -i "s|DEPLOY_DIR_PLACEHOLDER|$DEPLOY_DIR|g" $DEPLOY_DIR/backup.sh
sed -i "s|MONGODB_HOST_PLACEHOLDER|$MONGODB_HOST|g" $DEPLOY_DIR/backup.sh
sed -i "s|MONGODB_PASS_PLACEHOLDER|$MONGODB_PASS|g" $DEPLOY_DIR/backup.sh

chmod +x $DEPLOY_DIR/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $DEPLOY_DIR/backup.sh >> $DEPLOY_DIR/logs/backup.log 2>&1") | crontab -

log_success "Backup script created and scheduled"

################################################################################
# Step 20: Install Monitoring (Netdata)
################################################################################
log_info "Step 20: Installing Netdata monitoring (optional, this may take a few minutes)..."
read -p "Install Netdata for monitoring? (y/n): " INSTALL_NETDATA

if [ "$INSTALL_NETDATA" = "y" ]; then
    bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --disable-telemetry
    log_success "Netdata installed. Access at: http://$DOMAIN:19999"
else
    log_info "Skipping Netdata installation"
fi

################################################################################
# Step 21: Install PM2 Log Rotation
################################################################################
log_info "Step 21: Setting up PM2 log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
log_success "PM2 log rotation configured"

################################################################################
# Final Steps
################################################################################
echo ""
echo "════════════════════════════════════════════════════════════════"
log_success "DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Next Steps:"
echo ""
echo "1. Update environment variables in: $DEPLOY_DIR/backend/.env"
echo "   - Email configuration (EMAIL_*)"
echo "   - Cloudinary credentials (CLOUDINARY_*)"
echo ""
echo "2. Restart the application:"
echo "   cd $DEPLOY_DIR/backend"
echo "   pm2 reload ecosystem.config.js --env production"
echo ""
echo "3. Monitor your application:"
echo "   pm2 monit"
echo "   pm2 logs"
echo ""
echo "4. Check your application:"
echo "   Frontend: https://$DOMAIN"
echo "   API Health: https://$DOMAIN/api/health"
if [ "$INSTALL_NETDATA" = "y" ]; then
echo "   Monitoring: http://$DOMAIN:19999"
fi
echo ""
echo "5. Useful commands:"
echo "   - View logs: pm2 logs SmartMess-backend"
echo "   - Restart app: pm2 restart SmartMess-backend"
echo "   - Check status: pm2 status"
echo "   - Test MongoDB: mongosh $MONGODB_HOST:27017/SmartMess -u smartmess_app -p"
echo ""
log_warning "IMPORTANT: Remember to update your environment variables!"
echo ""
echo "════════════════════════════════════════════════════════════════"






