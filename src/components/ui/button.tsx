import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-base disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-teal-500 text-white hover:bg-teal-400 active:scale-[0.98] shadow-sm',
        secondary:
          'bg-background-input text-text-primary hover:bg-background-hover active:scale-[0.98]',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-background-hover',
        outline:
          'border border-border-default bg-transparent hover:bg-background-hover',
        danger:
          'bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-[0.98]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
