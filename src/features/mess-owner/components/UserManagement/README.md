# UserManagement Component

A comprehensive, responsive user management interface with advanced filtering, search, and view modes.

## Structure

```
UserManagement/
├── components/           # UI Components
│   ├── UserCard.tsx     # Individual user card component
│   ├── UserTableRow.tsx # Table row component
│   ├── SearchHeader.tsx # Search and filter header
│   ├── FilterModal.tsx  # Filter modal component
│   ├── AlphabetScroll.tsx # Alphabetical navigation
│   ├── ViewModeToggle.tsx # Cards/Table view toggle
│   ├── FilterSummary.tsx # Active filter display
│   ├── EmptyState.tsx   # No results state
│   ├── LoadingState.tsx # Loading state
│   ├── ErrorState.tsx   # Error state
│   ├── FloatingActionButton.tsx # Add user button
│   └── index.ts         # Component exports
├── hooks/               # Custom hooks
│   └── useUserManagement.ts # Main logic hook
├── types/               # TypeScript types
│   └── index.ts         # Type definitions
├── utils/               # Utility functions
│   └── colorUtils.ts    # Color scheme utilities
├── constants/           # Constants
│   └── filterOptions.ts # Filter configuration
├── UserManagement.tsx   # Main component
└── index.ts            # Main export
```

## Features

### Responsive Design
- **Mobile**: Optimized for touch interactions with larger touch targets
- **Tablet**: Balanced layout with improved spacing
- **Desktop**: Full-featured interface with table view option

### View Modes
- **Cards View**: Visual card layout with user avatars and detailed information
- **Table View**: Compact table layout for data-heavy operations (desktop only)

### Search & Filter
- **Real-time Search**: Search by name or email
- **Advanced Filtering**: Filter by status (Active, Inactive, Pending, Overdue)
- **Filter Summary**: Visual indicator of active filters

### Navigation
- **Alphabetical Scroll**: Quick navigation to users by first letter
- **Smooth Scrolling**: Animated scroll to selected users
- **Visual Feedback**: Highlighted letters and user cards

### State Management
- **Loading States**: Skeleton loading with progress indicators
- **Error Handling**: Graceful error states with retry options
- **Empty States**: Helpful messages when no users found

## Usage

```tsx
import UserManagement from './components/mess-owner/UserManagement';

function App() {
  return <UserManagement />;
}
```

## Props

The main component doesn't accept props as it manages its own state through the `useUserManagement` hook.

## Styling

The component uses the SmartMess design system with:
- Consistent color schemes for light/dark themes
- Responsive breakpoints (sm, md, lg, xl)
- Smooth animations and transitions
- Accessible focus states and keyboard navigation

## API Integration

The component integrates with the `messService.getMembers()` API to fetch user data and transforms it into the expected format.

## Performance

- Lazy loading of user data
- Efficient filtering and search algorithms
- Optimized re-renders with React hooks
- Smooth animations with CSS transitions 