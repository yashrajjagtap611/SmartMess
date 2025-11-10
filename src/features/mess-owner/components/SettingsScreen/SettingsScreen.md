# SmartMess SettingsScreen Module Documentation

## Overview

The SettingsScreen module serves as the main landing page for mess owner settings in the SmartMess application. It provides a centralized dashboard with navigation to all settings categories, mess profile information display, and photo upload functionality. This is the entry point that users see before navigating to specific settings modules.

## Architecture

### Directory Structure

```
src/features/mess-owner/components/SettingsScreen/
├── SettingsScreen.md              # This documentation file
├── SettingsScreen.tsx             # Main wrapper component
├── SettingsScreenContent.tsx      # Main content component
├── SettingsScreen.types.ts        # TypeScript interfaces
├── SettingsScreen.hooks.ts        # Custom hooks
├── SettingsScreen.utils.ts        # Utility functions
├── SettingsScreen.test.tsx        # Unit tests
├── index.ts                       # Module exports
└── components/                    # Sub-components
    ├── PhotoUpload.tsx           # Photo upload component
    ├── MessInfo.tsx              # Mess information display
    ├── SettingsNavigation.tsx    # Settings navigation grid
    └── index.ts                  # Component exports
```

### Component Hierarchy

```
SettingsScreen (Provider Wrapper)
└── MessProfileProvider
    └── SettingsScreenContent (Main Content)
        ├── SideNavigation (Common)
        ├── CommonHeader
        ├── PhotoUpload
        ├── MessInfo
        ├── SettingsNavigation
        └── BottomNavigation (Common)
```

## Features

### 1. Main Dashboard Interface

**Purpose**: Provide a centralized hub for accessing all mess owner settings.

**Key Features**:
- Clean, modern dashboard layout
- Responsive design for all screen sizes
- Dark/light theme support
- Loading states and error handling
- Navigation breadcrumbs

### 2. Photo Upload Management

**Purpose**: Allow mess owners to upload and manage their mess profile photo.

**Key Features**:
- Drag-and-drop photo upload
- Real-time upload progress tracking
- Image validation and compression
- Cloudinary integration for storage
- Error handling with user feedback
- Circular photo display with overlay controls

**Technical Implementation**:
```typescript
interface PhotoUploadProps {
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPhotoClick: () => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

**Validation Rules**:
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, WebP
- Upload timeout: 30 seconds

### 3. Mess Information Display

**Purpose**: Show key mess profile information at a glance.

**Key Features**:
- Mess name and location display
- College associations count
- Rating display with star visualization
- Member count statistics
- Dynamic data formatting

**Core Types**:
```typescript
interface MessInfoData {
  name: string;
  location: {
    city: string;
    state: string;
  };
  colleges: string[];
  rating: number;
  memberCount: number;
}
```

### 4. Settings Navigation Grid

**Purpose**: Provide intuitive navigation to all settings categories.

**Key Features**:
- Grid-based navigation layout
- Color-coded category icons
- Hover effects and animations
- Responsive grid (1-3 columns based on screen size)
- Accessibility-compliant navigation

**Navigation Items**:
```typescript
interface SettingsNavigationItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}
```

**Available Settings Categories**:
1. **Mess Profile** - Manage mess details and information
2. **Mess Plans** - Configure meal plans and pricing
3. **Operating Hours** - Set mess timings and schedules
4. **Security** - Manage account security settings
5. **Payment** - Configure payment methods and billing

### 5. Theme and Layout Management

**Purpose**: Provide consistent theming and responsive layout.

**Key Features**:
- Dark/light mode toggle
- Responsive sidebar navigation
- Mobile-optimized bottom navigation
- Smooth transitions and animations
- Consistent spacing and typography

## Technical Implementation

### State Management

The SettingsScreen uses a custom hook for comprehensive state management:

```typescript
export const useSettingsScreen = (props?: SettingsScreenProps) => {
  // Theme management
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  
  // Mess profile context integration
  const { 
    photo, 
    loading: photoLoading, 
    error: photoError, 
    uploadProgress, 
    handlePhotoChange: contextHandlePhotoChange, 
    handleDeletePhoto: contextHandleDeletePhoto, 
    messProfile,
    isInitialized
  } = useMessProfile();
  
  // Local state management
  const [state, setState] = useState<SettingsScreenState>({
    isDarkMode,
    loading: false,
    error: null,
    uploadProgress: null,
    isInitialized: false
  });
}
```

### Context Integration

The module integrates with several React contexts:

- **MessProfileContext**: Global mess profile state and photo management
- **ThemeContext**: Dark/light mode state management
- **UserContext**: Authentication and user data
- **Navigation Context**: Route management and navigation

### Utility Functions

The module includes comprehensive utility functions:

```typescript
// Configuration management
export const getSettingsScreenConfig = (): SettingsScreenConfig

// File validation
export const validatePhotoFile = (file: File): string | null

// Formatting utilities
export const formatFileSize = (bytes: number): string
export const formatMessInfo = (messProfile: any): MessInfoData

// Navigation utilities
export const getNavigationItemByPath = (path: string): SettingsNavigationItem | null
export const getNavigationItemById = (id: string): SettingsNavigationItem | null

// Error handling
export const getSettingsScreenErrorMessage = (error: any): string
```

## Core Types

### Main Component Types

```typescript
interface SettingsScreenProps {
  onNavigate?: (path: string) => void;
  onPhotoUpload?: (file: File) => void;
  onPhotoDelete?: () => void;
  onLogout?: () => void;
}

interface SettingsScreenState {
  isDarkMode: boolean;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  isInitialized: boolean;
}

interface SettingsScreenConfig {
  navigationItems: SettingsNavigationItem[];
  maxPhotoSize: number;
  allowedPhotoTypes: string[];
  uploadTimeout: number;
}
```

### Photo Upload Types

```typescript
interface PhotoUploadState {
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
}

interface PhotoUploadProps {
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPhotoClick: () => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

## API Integration

### Photo Upload Endpoints

The SettingsScreen integrates with photo upload APIs through the MessProfile context:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mess/photo` | Upload new mess photo |
| PUT | `/api/mess/profile/photo` | Update existing photo |
| GET | `/api/mess/profile/photo` | Get current photo URL |
| DELETE | `/api/mess/photo` | Delete mess photo |

### Mess Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mess/profile` | Get complete mess profile |
| PUT | `/api/mess/profile` | Update mess profile |

### Authentication

All API calls require:
- JWT token authentication
- Mess-owner role authorization
- Automatic token refresh handling
- Session management

## Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Approach */
.grid-cols-1          /* Default: Mobile */
.md:grid-cols-2       /* Tablet: 768px+ */
.lg:grid-cols-3       /* Desktop: 1024px+ */

/* Sidebar Behavior */
.lg:ml-90            /* Desktop: Fixed sidebar */
.pb-32 lg:pb-24      /* Mobile: Bottom nav spacing */
```

### Layout Adaptations

- **Mobile (< 768px)**: Single column grid, bottom navigation
- **Tablet (768px - 1024px)**: Two column grid, side navigation
- **Desktop (1024px+)**: Three column grid, fixed sidebar

## Styling and Theming

### CSS Classes Structure

```typescript
// Theme-aware classes
"bg-background transition-all duration-300"
"text-foreground"
"bg-card border border-border"
"hover:bg-accent hover:border-primary"

// Color-coded navigation items
"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
"bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
// ... other color variants
```

### Animation and Transitions

- **Loading States**: Spinning indicators with smooth animations
- **Hover Effects**: Scale and color transitions
- **Theme Switching**: Smooth color transitions
- **Navigation**: Slide and fade effects

## Error Handling

### Frontend Error Handling

```typescript
// Photo upload errors
if (error) {
  return (
    <div className="mt-3 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
      {error}
    </div>
  );
}

// Loading states
if (!isInitialized) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-foreground">Loading settings...</p>
      </div>
    </div>
  );
}
```

### Error Types

- **Network Errors**: Connection timeouts, server unavailability
- **Validation Errors**: File size, format validation
- **Authentication Errors**: Token expiry, permission issues
- **Upload Errors**: Cloudinary failures, processing errors

## Performance Optimizations

### React Optimizations

```typescript
// Component memoization
export const PhotoUpload = React.memo<PhotoUploadProps>(({ ... }) => {
  // Component implementation
});

// Ref usage for file inputs
const fileInputRef = useRef<HTMLInputElement>(null);

// Efficient state updates
setState(prev => ({
  ...prev,
  loading: photoLoading,
  error: photoError,
  uploadProgress,
  isInitialized
}));
```

### Image Optimization

- **Lazy Loading**: Images load on demand
- **Caching**: CachedCircularImage component
- **Compression**: Automatic image optimization
- **Format Support**: WebP for modern browsers

## Testing

### Unit Test Coverage

```typescript
// Component rendering tests
describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    render(<SettingsScreen />);
  });

  it('displays navigation items correctly', () => {
    // Test navigation grid rendering
  });

  it('handles photo upload correctly', () => {
    // Test photo upload functionality
  });
});
```

### Test Scenarios

- **Component Rendering**: All components render without errors
- **Navigation**: All navigation links work correctly
- **Photo Upload**: File validation and upload process
- **Error States**: Error handling and display
- **Loading States**: Loading indicators and states
- **Theme Switching**: Dark/light mode transitions

## Security Considerations

### File Upload Security

```typescript
// File validation
export const validatePhotoFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }
  
  return null;
};
```

### Authentication Security

- **JWT Token Validation**: All API calls validated
- **Role-based Access**: Mess-owner role required
- **Session Management**: Automatic logout on token expiry
- **CSRF Protection**: Token-based request validation

## Accessibility

### ARIA Compliance

```typescript
// Button accessibility
<button
  type="button"
  onClick={onPhotoClick}
  aria-label="Upload photo"
  disabled={loading}
>
  <CameraIcon className="w-5 h-5" />
</button>

// Focus management
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

### Keyboard Navigation

- **Tab Order**: Logical tab sequence
- **Focus Indicators**: Clear focus states
- **Keyboard Shortcuts**: Standard navigation keys
- **Screen Reader Support**: Proper ARIA labels

## Mobile Optimization

### Touch Interactions

```typescript
// Touch-friendly button sizes
className="p-4 rounded-xl"  // Minimum 44px touch target

// Hover states for touch devices
className="hover:bg-accent hover:border-primary hover:shadow-md"
```

### Progressive Web App Features

- **Responsive Images**: Optimized for mobile screens
- **Touch Gestures**: Swipe and tap interactions
- **Offline Support**: Cached components and data
- **Performance**: Optimized loading and rendering

## Future Enhancements

### Planned Features

1. **Advanced Photo Management**
   - Multiple photo upload
   - Photo gallery view
   - Image editing capabilities
   - Bulk photo operations

2. **Enhanced Dashboard Analytics**
   - Quick stats widgets
   - Recent activity feed
   - Performance metrics
   - Usage analytics

3. **Improved Navigation**
   - Search functionality
   - Favorites/shortcuts
   - Recent settings access
   - Breadcrumb navigation

4. **Customization Options**
   - Dashboard layout preferences
   - Color theme customization
   - Widget arrangement
   - Personal shortcuts

### Technical Improvements

1. **Performance Enhancements**
   - Code splitting for components
   - Lazy loading optimization
   - Image preloading strategies
   - Bundle size optimization

2. **Developer Experience**
   - Storybook integration
   - Enhanced testing coverage
   - Documentation improvements
   - Type safety enhancements

## Troubleshooting

### Common Issues

1. **Photo Upload Failures**
   ```typescript
   // Check file validation
   const validationError = validatePhotoFile(file);
   if (validationError) {
     console.error('Validation failed:', validationError);
   }
   
   // Check network connectivity
   // Verify Cloudinary configuration
   // Check file permissions
   ```

2. **Navigation Issues**
   ```typescript
   // Verify route configuration
   // Check authentication state
   // Validate user permissions
   ```

3. **Theme Problems**
   ```typescript
   // Clear localStorage theme data
   localStorage.removeItem('theme');
   
   // Reset theme context
   toggleTheme();
   ```

### Debug Mode

Enable debug logging:

```typescript
// Environment variables
REACT_APP_DEBUG=true
REACT_APP_SETTINGS_DEBUG=true

// Console logging
console.log('SettingsScreen state:', state);
console.log('MessProfile context:', messProfile);
```

## Contributing

### Development Guidelines

1. **Component Structure**: Follow established patterns
2. **Type Safety**: Use TypeScript interfaces
3. **Testing**: Write comprehensive unit tests
4. **Documentation**: Update docs for new features
5. **Performance**: Optimize for mobile and desktop

### Code Style

```typescript
// Component naming
export const ComponentName: React.FC<ComponentProps> = ({ ... }) => {
  // Implementation
};

// Hook naming
export const useComponentName = (props?: ComponentProps) => {
  // Hook implementation
};

// Utility naming
export const getComponentConfig = (): ComponentConfig => {
  // Utility implementation
};
```

### Pull Request Checklist

- [ ] Component renders without errors
- [ ] All props are properly typed
- [ ] Unit tests pass
- [ ] Responsive design verified
- [ ] Accessibility compliance checked
- [ ] Performance impact assessed
- [ ] Documentation updated

---

*Last updated: 2025-01-29*
*Version: 1.0.0*
