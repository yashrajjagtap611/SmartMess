export interface ApplyLeaveProps {
  id?: string;
  className?: string;
  onLeaveApplied?: (leaveRequest: any) => void;
  onLeaveExtended?: (leaveRequest: any) => void;
  onLeaveCancelled?: (leaveId: string) => void;
}



