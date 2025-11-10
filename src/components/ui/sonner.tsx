import { useTheme } from "../theme/theme-provider"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:SmartMess-light-bg dark:SmartMess-dark-bg group-[.toaster]:SmartMess-light-text dark:SmartMess-dark-text group-[.toaster]:SmartMess-light-border dark:SmartMess-dark-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary",
          actionButton:
            "group-[.toast]:SmartMess-light-primary dark:SmartMess-dark-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
