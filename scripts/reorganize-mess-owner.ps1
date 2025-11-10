# PowerShell script to reorganize mess-owner components

$srcPath = "d:\love\MeesHub\mees-hub-auth\SmartMess\src"
$messOwnerPath = "$srcPath\features\mess-owner"
$componentsPath = "$messOwnerPath\components"

# List of mess owner components to reorganize
$components = @(
    "Dashboard",
    "Profile",
    "BillingPayments",
    "ChatCommunity",
    "FeedbackComplaints",
    "LeaveManagement",
    
    "ReportsAnalytics",
    "UserManagement",
    "Services",
    "Notification",
    "SettingsScreen"
)

# List of settings components
$settingsComponents = @(
    "MessProfile",
    "MealPlan",
    "OperatingHours",
    "Payment",
    "Security"
)

function Create-ComponentStructure {
    param (
        [string]$basePath,
        [string]$componentName
    )

    # Create component directory if it doesn't exist
    $componentDir = "$basePath\$componentName"
    if (-not (Test-Path $componentDir)) {
        New-Item -ItemType Directory -Force -Path $componentDir
    }

    # Create standard component files if they don't exist
    @(
        "$componentDir\$componentName.tsx",
        "$componentDir\$componentName.types.ts",
        "$componentDir\$componentName.hooks.ts",
        "$componentDir\$componentName.utils.ts",
        "$componentDir\$componentName.test.tsx",
        "$componentDir\index.ts"
    ) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType File -Force -Path $_
        }
    }
}

# Create features/mess-owner structure
@(
    $messOwnerPath,
    "$messOwnerPath\components",
    "$messOwnerPath\hooks",
    "$messOwnerPath\utils",
    "$messOwnerPath\types",
    "$messOwnerPath\services",
    "$messOwnerPath\constants"
) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Force -Path $_
    }
}

# Reorganize main components
foreach ($component in $components) {
    Create-ComponentStructure $componentsPath $component
}

# Create Settings directory and its components
$settingsPath = "$componentsPath\Settings"
if (-not (Test-Path $settingsPath)) {
    New-Item -ItemType Directory -Force -Path $settingsPath
}

foreach ($component in $settingsComponents) {
    Create-ComponentStructure $settingsPath $component
}

# Create shared components directory
$sharedPath = "$componentsPath\shared"
if (-not (Test-Path $sharedPath)) {
    New-Item -ItemType Directory -Force -Path $sharedPath
}

# Create index.ts files
@"
// Export all mess owner components
$(($components | ForEach-Object { "export { default as MessOwner$_ } from './components/$_';" }) -join "`n")

// Export settings components
$(($settingsComponents | ForEach-Object { "export { default as $_ } from './components/Settings/$_';" }) -join "`n")
"@ | Set-Content -Path "$messOwnerPath\index.ts"

Write-Host "Mess Owner component reorganization completed!"
