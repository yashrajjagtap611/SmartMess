export interface SecurityProps {
  // Add any props if needed
}

export interface SecurityState {
  profileVisible: boolean;
  contactVisible: boolean;
  ratingsVisible: boolean;
  currentPassword: string;
  newPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
}

export interface SecurityFormProps {
  profileVisible: boolean;
  contactVisible: boolean;
  ratingsVisible: boolean;
  currentPassword: string;
  newPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  onProfileVisibleChange: (value: boolean) => void;
  onContactVisibleChange: (value: boolean) => void;
  onRatingsVisibleChange: (value: boolean) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onShowCurrentPasswordChange: (value: boolean) => void;
  onShowNewPasswordChange: (value: boolean) => void;
  onUpdatePassword: () => void;
}






