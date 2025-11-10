# Component Structure Guide

## Overview
This guide outlines the standard component structure used in the SmartMess project. Each component follows a consistent organization pattern to improve maintainability and reusability.

## Standard Component Structure
```
ComponentName/
├── ComponentName.tsx       # Main component implementation
├── ComponentName.test.tsx  # Component tests
├── ComponentName.types.ts  # TypeScript interfaces and types
├── ComponentName.hooks.ts  # Custom hooks specific to the component
├── ComponentName.utils.ts  # Utility functions
└── index.ts              # Exports
```

## File Purposes

### ComponentName.tsx
The main component implementation file. Contains the React component code and JSX.

### ComponentName.test.tsx
Contains all tests related to the component, including unit tests and integration tests.

### ComponentName.types.ts
Defines TypeScript interfaces and types used by the component:
- Props interface
- State types
- Event handler types
- Other related type definitions

### ComponentName.hooks.ts
Custom hooks that are specific to the component:
- State management hooks
- Side effect hooks
- Data fetching hooks
- Other component-specific hooks

### ComponentName.utils.ts
Utility functions used by the component:
- Helper functions
- Data transformations
- Calculations
- Constants

### index.ts
Exports the component and its related types/utilities:
- Default export of the main component
- Named exports for types, hooks, and utilities

## Usage

To create a new component following this structure:

1. Run the component generator script:
```bash
npm run generate-component ComponentName
```

2. Implement the component in the generated files.

3. Export the component through the feature's index.ts file.

## Benefits

- **Separation of Concerns**: Each aspect of the component is isolated in its own file
- **Maintainability**: Easier to find and update specific parts of the component
- **Testability**: Tests are organized alongside the component they test
- **Reusability**: Types and utilities are easily importable
- **Scalability**: Structure supports components of any size
