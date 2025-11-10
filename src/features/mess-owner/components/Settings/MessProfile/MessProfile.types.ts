export interface MessProfileProps {
  // Add any props if needed
}

export interface MessProfileState {
  messProfile: MessProfileData;
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  validationErrors: string[];
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  saveMessage: string;
  isInitialized: boolean;
}

export interface MessProfileData {
  name: string;
  types: string[];
  location: LocationData;
  colleges: string[];
  collegeInput: string;
  ownerPhone: string;
  ownerEmail: string;
}

export interface LocationData {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface MessProfileFormProps {
  messProfile: MessProfileData;
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  validationErrors: string[];
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  saveMessage: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onMessProfileChange: (field: string, value: any) => void;
  onLocationChange: (field: string, value: string) => void;
  onAddCollege: () => void;
  onRemoveCollege: (idx: number) => void;
  onMessTypeToggle: (type: string) => void;
  onLogoClick: () => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onGetCurrentLocation?: () => Promise<void>;
  isLoadingLocation?: boolean;
}

export interface LogoUploadProps {
  photo: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLogoClick: () => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}






