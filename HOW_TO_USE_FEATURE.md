# How to Use Tutorial Videos Feature - Complete Implementation

## 🎯 Overview
Implemented a comprehensive "How to Use" tutorial videos system where admins can manage tutorial videos and users/mess owners can view them based on their role.

## ✨ Features Implemented

### **Backend (Complete)**

#### 1. **Database Model**
- **File**: `backend/src/models/TutorialVideo.ts`
- **Fields**:
  - `title`: Video title (required)
  - `description`: Optional description
  - `videoUrl`: YouTube/Vimeo embed URL (required)
  - `category`: user, mess-owner, or general (required)
  - `order`: Display order
  - `thumbnailUrl`: Optional thumbnail image
  - `duration`: Video duration (e.g., "5:30")
  - `isActive`: Active/inactive status
  - `createdBy`, `updatedBy`: User tracking

#### 2. **Admin API Routes**
- **File**: `backend/src/routes/admin/tutorialVideos.ts`
- **Endpoints**:
  - `GET /api/admin/tutorial-videos` - List all videos (admin only)
  - `GET /api/admin/tutorial-videos/:id` - Get single video
  - `POST /api/admin/tutorial-videos` - Create video
  - `PUT /api/admin/tutorial-videos/:id` - Update video
  - `DELETE /api/admin/tutorial-videos/:id` - Delete video

#### 3. **Public API Routes**
- **File**: `backend/src/routes/tutorialVideos.ts`
- **Endpoints**:
  - `GET /api/tutorial-videos` - Get all active videos (public)
  - `GET /api/tutorial-videos/category/:category` - Filter by category
  - `GET /api/tutorial-videos/:id` - Get single video

#### 4. **Route Registration**
- Admin routes registered in `backend/src/routes/admin/index.ts`
- Public routes registered in `backend/src/routes/index.ts`
- Model exported in `backend/src/models/index.ts`

### **Frontend (Complete)**

#### 5. **API Service**
- **File**: `src/services/tutorialVideosService.ts`
- **Services**:
  - `tutorialVideosService`: Public viewing (no auth)
  - `adminTutorialVideosService`: Admin management (auth required)

#### 6. **Admin Management Component**
- **Files**: 
  - `src/features/admin/components/TutorialVideosManagement/TutorialVideosManagement.tsx`
  - `src/features/admin/components/TutorialVideosManagement/TutorialVideosManagement.hooks.ts`
  - `src/features/admin/components/TutorialVideosManagement/index.ts`
- **Features**:
  - View all tutorial videos
  - Create new tutorial videos
  - Edit existing videos
  - Delete videos
  - Filter by category
  - Toggle active/inactive status
  - Set display order

#### 7. **User/Mess Owner Viewer Component**
- **Files**: 
  - `src/features/HowToUse/components/TutorialVideosView.tsx`
  - `src/features/HowToUse/index.ts`
- **Features**:
  - View active tutorial videos
  - Filter by category (All, General, User, Mess Owner)
  - Play videos in modal with iframe embed
  - Responsive grid layout
  - Video thumbnails with play overlay

#### 8. **Navigation & Routes**
- **Routes Added**:
  - User: `/user/how-to-use`
  - Mess Owner: `/mess-owner/how-to-use`
  - Admin: `/admin/tutorial-videos`
- **Navigation Items Added**:
  - User navigation: "How to Use" menu item
  - Mess Owner navigation: "How to Use" menu item
  - Admin navigation: "Tutorial Videos" menu item

#### 9. **Route Integration**
- Updated `src/constants/routes.ts` with new routes
- Updated `src/App.tsx` with route definitions
- Exported components from feature index files

## 🔗 How to Use

### **For Admins:**

1. Navigate to **Admin Dashboard** → **Tutorial Videos**
2. Click **"Add Video"** to create a new tutorial
3. Fill in the form:
   - **Title**: Name of the tutorial
   - **Description**: Optional explanation
   - **Video URL**: Embed URL (YouTube/Vimeo)
   - **Category**: Choose User, Mess Owner, or General
   - **Order**: Display order (0-99)
   - **Thumbnail URL**: Optional image URL
   - **Duration**: Video length (e.g., "5:30")
   - **Active**: Toggle to show/hide
4. Click **"Create"** to save
5. Edit or delete videos as needed

### **For Users:**

1. Navigate to **User Dashboard** → **How to Use**
2. Browse tutorial videos
3. Filter by category (All, General, Apps-specific)
4. Click any video card to watch
5. Videos play in a modal overlay

### **For Mess Owners:**

1. Navigate to **Mess Owner Dashboard** → **How to Use**
2. Browse tutorial videos
3. Filter by category (All, General, Mess Owner-specific)
4. Click any video card to watch
5. Videos play in a modal overlay

## 📁 File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── TutorialVideo.ts          # Database model
│   └── routes/
│       ├── admin/
│       │   └── tutorialVideos.ts     # Admin CRUD routes
│       └── tutorialVideos.ts         # Public viewing routes

src/
├── features/
│   ├── admin/
│   │   └── components/
│   │       └── TutorialVideosManagement/
│   │           ├── TutorialVideosManagement.tsx
│   │           ├── TutorialVideosManagement.hooks.ts
│   │           └── index.ts
│   └── HowToUse/
│       ├── components/
│       │   └── TutorialVideosView.tsx
│       └── index.ts
├── services/
│   └── tutorialVideosService.ts      # API service layer
├── constants/
│   └── routes.ts                     # Route definitions
└── App.tsx                           # Route registration
```

## 🎨 UI Features

### **Admin Interface**
- Grid layout showing all videos
- Category badges (blue=User, green=Mess Owner, gray=General)
- Active/Inactive badges
- Quick Edit and Delete buttons
- Modal form for create/edit
- Form validation
- Loading states
- Success/Error toasts

### **Viewer Interface**
- Responsive card grid
- Category tabs for filtering
- Video thumbnails with play overlay
- Modal video player
- Duration display
- Description preview
- No videos message state

## 🔐 Security

- **Admin routes**: Protected by `requireAuth` and `requireAdmin` middleware
- **Public routes**: No authentication required
- **Frontend**: Uses `apiClient` with automatic auth header injection
- **Validation**: Input validation on both frontend and backend

## 🌐 API Endpoints

### Admin Endpoints (Auth Required)
```
GET    /api/admin/tutorial-videos       # List all
GET    /api/admin/tutorial-videos/:id   # Get one
POST   /api/admin/tutorial-videos       # Create
PUT    /api/admin/tutorial-videos/:id   # Update
DELETE /api/admin/tutorial-videos/:id   # Delete
```

### Public Endpoints (No Auth)
```
GET /api/tutorial-videos                      # List active
GET /api/tutorial-videos/category/:category   # Filter by category
GET /api/tutorial-videos/:id                  # Get one
```

## ✨ Benefits

1. **Centralized Learning**: Users can learn how to use the platform
2. **Role-Specific Content**: Different tutorials for different user types
3. **Easy Management**: Admins can easily add/edit/remove videos
4. **Professional UX**: Clean, modern interface with video modals
5. **Scalable**: Add as many videos as needed
6. **Flexible**: Support for any video hosting platform with embed URLs

## 🚀 Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Login as admin and navigate to Tutorial Videos
4. Add a test video (use YouTube embed URL)
5. Login as user and view the tutorial
6. Test different categories and filtering

## 📝 Notes

- Video URLs should be embed URLs (YouTube, Vimeo, etc.)
- Thumbnail URLs are optional but recommended for better UX
- Order field determines display sequence
- Category determines which users can see the video
- Active status allows admins to hide videos without deleting them

---

**Status**: ✅ Complete and Ready for Testing


