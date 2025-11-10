import * as React from "react";
import { DayPicker } from "react-day-picker"; //@ts-ignore

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:SmartMess-light-accent dark:SmartMess-dark-accent/50 [&:has([aria-selected])]:SmartMess-light-accent dark:SmartMess-dark-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground hover:SmartMess-light-primary dark:SmartMess-dark-primary hover:text-primary-foreground focus:SmartMess-light-primary dark:SmartMess-dark-primary focus:text-primary-foreground",
        day_today: "SmartMess-light-accent dark:SmartMess-dark-accent text-accent-foreground",
        day_outside:
          "day-outside SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary opacity-50 aria-selected:SmartMess-light-accent dark:SmartMess-dark-accent/50 aria-selected:SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary aria-selected:opacity-30",
        day_disabled: "SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary opacity-50",
        day_range_middle:
          "aria-selected:SmartMess-light-accent dark:SmartMess-dark-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
