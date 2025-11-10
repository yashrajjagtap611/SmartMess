import { toast } from "../hooks/use-toast"

// Utility for conditionally joining classNames
export function cn(...args: any[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ');
}

// Toast utility functions for better UX
export const toastUtils = {
  success: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "success",
    })
  },
  
  error: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    })
  },
  
  warning: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "warning",
    })
  },
  
  info: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    })
  },
}