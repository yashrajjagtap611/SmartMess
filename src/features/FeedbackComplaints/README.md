# Feedback & Complaints Management System

## Overview
This is a comprehensive Feedback & Complaints Management System for the SmartMess application. It allows users to submit feedback and complaints about meal services, and enables mess owners and admins to manage and respond to these issues effectively.

## Features Implemented

### 1. User Feedback Submission
- Users can submit feedback with ratings (1-5 stars) and detailed comments
- Feedback is associated with specific meals (breakfast, lunch, dinner) and dates
- Users can select complaint types (service, food quality, hygiene, staff behavior, billing, other)

### 2. Complaint Management
- Complaint tracking with priority levels (low, medium, high)
- Resolution status tracking (resolved/unresolved)
- Escalation capability for high-priority complaints

### 3. Response System
- Mess owners can respond to feedback and complaints
- Response history is maintained for each complaint
- Users can see responses from mess owners

### 4. Dashboard & Statistics
- Complaint statistics dashboard showing total, resolved, and unresolved complaints
- Filtering capabilities by date range, rating, complaint type, and status
- Visual indicators for complaint priority levels

### 5. Component Architecture
- **ComplaintForm**: Form for submitting new complaints
- **ComplaintList**: Displays list of complaints with response functionality
- **ComplaintStats**: Dashboard showing complaint statistics
- **ComplaintFilters**: Filtering options for the complaint list
- **FeedbackComplaints**: Main container component

### 6. Hooks & Utilities
- **useFeedbackComplaints**: Custom hook for managing feedback/complaints state and API calls
- **Utility functions**: Helper functions for formatting dates, calculating time ago, and styling

## Technical Implementation

### Technologies Used
- React with TypeScript
- Tailwind CSS for styling
- Jest for testing
- React Testing Library for component testing

### Data Flow
1. Users submit complaints through the ComplaintForm
2. Complaints are stored in the database with relevant metadata
3. Mess owners can view complaints in the ComplaintList
4. Owners can respond to complaints or mark them as resolved
5. Admins can escalate high-priority complaints
6. Statistics are calculated and displayed in the dashboard

### API Integration
The system integrates with existing API endpoints:
- `POST /api/feedback` - Create new feedback/complaint
- `GET /api/feedback` - Retrieve feedback/complaints
- `POST /api/feedback/:id/respond` - Respond to a feedback/complaint
- `PUT /api/feedback/:id/resolve` - Mark a complaint as resolved
- `GET /api/feedback/stats` - Get feedback/complaint statistics

## Future Enhancements
- Escalation workflow to admin panel
- Priority-based notifications
- Integration with email/SMS notifications
- Advanced reporting and analytics
- Attachment support for complaints

## How to Use
1. Navigate to the Feedback & Complaints section
2. Click "New Complaint" to submit a new complaint
3. Fill out the complaint form with details
4. View existing complaints in the list
5. Respond to complaints or mark them as resolved
6. Use filters to find specific complaints
7. Monitor statistics in the dashboard

## Demo
A demo page is available at `/feedback-demo` to showcase the feature without requiring authentication.