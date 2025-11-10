# PowerShell script to reorganize components following the standard structure

# Function to create component folder structure
function Create-ComponentStructure {
    param (
        [string]$componentPath,
        [string]$componentName
    )

    # Create component directory
    New-Item -ItemType Directory -Force -Path "$componentPath/$componentName"

    # Create component files
    @(
        "$componentPath/$componentName/$componentName.tsx",
        "$componentPath/$componentName/$componentName.test.tsx",
        "$componentPath/$componentName/$componentName.types.ts",
        "$componentPath/$componentName/$componentName.hooks.ts",
        "$componentPath/$componentName/$componentName.utils.ts",
        "$componentPath/$componentName/index.ts"
    ) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType File -Force -Path $_
        }
    }
}

# Base paths
$srcPath = "d:\love\MeesHub\mees-hub-auth\SmartMess\src"
$componentsPath = "$srcPath\components"
$featuresPath = "$srcPath\features"

# Process UI Components
Get-ChildItem "$componentsPath\ui" -Filter "*.tsx" | ForEach-Object {
    $componentName = $_.BaseName
    Create-ComponentStructure "$componentsPath\ui" $componentName
    
    # Move existing component file
    Move-Item $_.FullName "$componentsPath\ui\$componentName\$componentName.tsx" -Force
}

# Process Common Components
Get-ChildItem "$componentsPath\common" -Recurse -Filter "*.tsx" | ForEach-Object {
    $componentName = $_.BaseName
    Create-ComponentStructure "$componentsPath\common" $componentName
    
    # Move existing component file
    Move-Item $_.FullName "$componentsPath\common\$componentName\$componentName.tsx" -Force
}

# Process Feature Components
Get-ChildItem "$featuresPath" -Recurse -Filter "*.tsx" | ForEach-Object {
    if ($_.Directory.Name -eq "components") {
        $componentName = $_.BaseName
        $featurePath = $_.Directory.Parent.FullName
        Create-ComponentStructure "$featurePath\components" $componentName
        
        # Move existing component file
        Move-Item $_.FullName "$featurePath\components\$componentName\$componentName.tsx" -Force
    }
}

# Create index.ts files for exports
$indexContent = @"
// Export all components from their respective folders
"@

@("$componentsPath\ui", "$componentsPath\common", "$featuresPath") | ForEach-Object {
    if (-not (Test-Path "$_\index.ts")) {
        Set-Content -Path "$_\index.ts" -Value $indexContent
    }
}

Write-Host "Component reorganization completed!"
