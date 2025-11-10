const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Find all route handlers that use userId but don't declare it
    const routeHandlerPattern = /router\.(get|post|put|delete)\([^)]+\)\s*=>\s*{([^}]+)}/g;
    
    content = content.replace(routeHandlerPattern, (match, method, body) => {
      // Check if the body uses userId but doesn't declare it
      if (body.includes('userId') && !body.includes('const userId = (req as any).user.id;')) {
        // Add userId declaration at the beginning of the function body
        const newBody = body.replace(/^\s*/, '    const userId = (req as any).user.id;\n    ');
        modified = true;
        return match.replace(body, newBody);
      }
      return match;
    });

    // Also fix async function patterns
    const asyncFunctionPattern = /async \(req: Request, res: Response, _next: NextFunction\) => {([^}]+)}/g;
    
    content = content.replace(asyncFunctionPattern, (match, body) => {
      if (body.includes('userId') && !body.includes('const userId = (req as any).user.id;')) {
        const newBody = body.replace(/^\s*/, '    const userId = (req as any).user.id;\n    ');
        modified = true;
        return match.replace(body, newBody);
      }
      return match;
    });

    // Fix specific patterns for different file types
    if (filePath.includes('mealPlan.ts') || filePath.includes('meals.ts') || filePath.includes('messProfile.ts') || filePath.includes('operatingHours.ts') || filePath.includes('notifications.ts') || filePath.includes('paymentSettings.ts')) {
      // Fix route handlers that use userId in shorthand properties
      const shorthandPattern = /\{ userId \}/g;
      if (shorthandPattern.test(content)) {
        content = content.replace(shorthandPattern, '{ userId: (req as any).user.id }');
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('Starting userId declaration fixes...');

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

let fixedCount = 0;
let totalFiles = tsFiles.length;

console.log(`Found ${totalFiles} TypeScript files to check...`);

tsFiles.forEach(filePath => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} out of ${totalFiles} files.`);
console.log('UserId declaration fixes completed!');
