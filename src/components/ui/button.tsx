import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 touch-target-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg gap-2",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md gap-2",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md gap-2",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md gap-2",
        ghost: "hover:bg-accent hover:text-accent-foreground gap-2",
        link: "text-primary underline-offset-4 hover:underline gap-2",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-md hover:shadow-lg gap-2",
        gradient: "bg-gradient-primary text-primary-foreground hover:shadow-lg shadow-md gap-2",
      },
      size: {
        default: "h-12 px-6 py-3 [&_svg]:w-4 [&_svg]:h-4",
        sm: "h-10 rounded-lg px-4 text-xs [&_svg]:w-4 [&_svg]:h-4",
        lg: "h-14 rounded-xl px-8 text-base [&_svg]:w-5 [&_svg]:h-5",
        icon: "h-12 w-12 p-0 gap-0 [&_svg]:w-5 [&_svg]:h-5",
        "icon-sm": "h-10 w-10 p-0 gap-0 [&_svg]:w-4 [&_svg]:h-4",
        "icon-lg": "h-14 w-14 p-0 gap-0 [&_svg]:w-6 [&_svg]:h-6",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "destructive", "outline", "secondary", "ghost", "accent", "gradient"],
        size: ["icon", "icon-sm", "icon-lg"],
        class: "flex items-center justify-center"
      }
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
