export interface SettingsScreenProps {
  onNavigate?: (path: string) => void;
  onPhotoUpload?: (file: File) => void;
  onPhotoDelete?: () => void;
  onLogout?: () => void;
}

export interface SettingsScreenState {
  isDarkMode: boolean;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  isInitialized: boolean;
}

export interface SettingsNavigationItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

export interface PhotoUploadState {
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
}

export interface MessInfoData {
  name: string;
  location: {
    city: string;
    state: string;
  };
  colleges: string[];
  rating: number;
  memberCount: number;
}

export interface SettingsScreenConfig {
  navigationItems: SettingsNavigationItem[];
  maxPhotoSize: number;
  allowedPhotoTypes: string[];
  uploadTimeout: number;
}

export interface PhotoUploadProps {
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPhotoClick: () => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface MessInfoProps {
  messProfile: any;
}

export interface SettingsNavigationProps {
  onNavigate: (path: string) => void;
}
