import path from 'path';
import fs from 'fs/promises';

async function generateComponentStructure(componentPath: string, componentName: string) {
  // Component templates
  const templates = {
    component: `import React from 'react';
import { ${componentName}Props } from './${componentName}.types';

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default ${componentName};
`,
    types: `export interface ${componentName}Props {
  // Define component props here
}
`,
    hooks: `import { useState, useEffect } from 'react';

export function use${componentName}() {
  // Custom hook implementation
  return {};
}
`,
    utils: `// Utility functions for ${componentName}
export function utils() {
  // Implement utility functions
}
`,
    test: `import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('should render successfully', () => {
    // Add your test cases
  });
});
`,
    index: `export { default } from './${componentName}';
export * from './${componentName}.types';
export * from './${componentName}.hooks';
export * from './${componentName}.utils';
`
  };

  // Create component directory
  await fs.mkdir(path.join(componentPath, componentName), { recursive: true });

  // Create component files
  const files = {
    [`${componentName}.tsx`]: templates.component,
    [`${componentName}.types.ts`]: templates.types,
    [`${componentName}.hooks.ts`]: templates.hooks,
    [`${componentName}.utils.ts`]: templates.utils,
    [`${componentName}.test.tsx`]: templates.test,
    'index.ts': templates.index
  };

  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(componentPath, componentName, fileName);
    await fs.writeFile(filePath, content);
  }
}

// Example usage:
// generateComponentStructure('./src/components', 'Button');
