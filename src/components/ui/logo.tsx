import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  textClassName?: string
}

const sizeMap = {
  sm: {
    container: "w-6 h-6",
    icon: "w-4 h-4",
    text: "text-base"
  },
  md: {
    container: "w-8 h-8", 
    icon: "w-5 h-5",
    text: "text-xl"
  },
  lg: {
    container: "w-12 h-12",
    icon: "w-7 h-7", 
    text: "text-2xl"
  }
}

export function Logo({ 
  size = "md", 
  showText = true, 
  className,
  textClassName,
  ...props 
}: LogoProps) {
  const sizes = sizeMap[size]
  
  return (
    <div 
      className={cn("flex items-center space-x-2", className)} 
      {...props}
    >
      <div className={cn(
        "bg-primary rounded-lg flex items-center justify-center flex-shrink-0",
        sizes.container
      )}>
        <Sparkles className={cn("text-primary-foreground", sizes.icon)} />
      </div>
      {showText && (
        <span className={cn(
          "font-bold text-foreground", 
          sizes.text,
          textClassName
        )}>
          Clean Report
        </span>
      )}
    </div>
  )
}