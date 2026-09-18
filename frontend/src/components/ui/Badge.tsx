import * as React from "react"
import { cn } from "../../lib/utils"

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "danger" | "outline" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200": variant === "default",
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200": variant === "success",
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200": variant === "warning",
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200": variant === "danger",
          "text-gray-800 border-gray-300": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}
