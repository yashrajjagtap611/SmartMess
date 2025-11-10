# SmartMess Development Setup Script
# This script helps set up the development environment

Write-Host "Setting up SmartMess Development Environment..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    # Create basic .env content
    $envContent = @"
# ===========================================
# SmartMess Backend Environment Configuration
# ===========================================
# Development Environment

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=5000
HOST=localhost
FRONTEND_URL=http://localhost:5173

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
MONGODB_URI=mongodb://localhost:27017/SmartMess

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-development
JWT_EXPIRES_IN=30d

# ===========================================
# RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@example.com
EMAIL_PASS=test-password
EMAIL_FROM=test@example.com

# Disable email sending in development
DISABLE_EMAIL=true

# ===========================================
# OTP CONFIGURATION
# ===========================================
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# ===========================================
# CLOUDINARY CONFIGURATION
# ===========================================
CLOUDINARY_CLOUD_NAME=test-cloud
CLOUDINARY_API_KEY=test-api-key
CLOUDINARY_API_SECRET=test-api-secret

# ===========================================
# FILE UPLOAD CONFIGURATION
# ===========================================
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
"@

    # Write .env file
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created successfully!" -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "MongoDB service not running. Starting it..." -ForegroundColor Yellow
        Start-Service -Name MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        
        $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
        if ($mongoService.Status -eq "Running") {
            Write-Host "MongoDB service started successfully" -ForegroundColor Green
        } else {
            Write-Host "Failed to start MongoDB service" -ForegroundColor Red
            Write-Host "You may need to start MongoDB manually or install it as a service" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "MongoDB service not found. You may need to install it as a service" -ForegroundColor Yellow
}

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
npm run build

# Start the server
Write-Host "Starting the backend server..." -ForegroundColor Green
Write-Host "Server will run on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend should connect to this URL" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
