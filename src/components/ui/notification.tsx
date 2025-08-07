"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "border-green-200 bg-green-50 text-green-900",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
        error: "border-red-200 bg-red-50 text-red-900",
        info: "border-blue-200 bg-blue-50 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  default: Info,
}

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: string
  onClose?: () => void
  showCloseButton?: boolean
  autoClose?: boolean
  duration?: number
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, variant, title, description, onClose, showCloseButton = true, autoClose = false, duration = 5000, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const Icon = icons[variant || "default"]

    React.useEffect(() => {
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [autoClose, duration, onClose])

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <div className="flex-1">
          {title && (
            <h4 className="mb-1 text-sm font-medium leading-none">
              {title}
            </h4>
          )}
          {description && (
            <div className="text-sm [&_p]:leading-relaxed">
              {description}
            </div>
          )}
        </div>
        {showCloseButton && (
          <button
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  }
)
Notification.displayName = "Notification"

export { Notification, notificationVariants } 