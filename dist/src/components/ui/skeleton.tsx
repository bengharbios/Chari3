import { cn } from "@/lib/utils"

/**
 * Skeleton — Loading placeholder component
 *
 * Design Standard: Uses muted surface color (gray), NOT accent/brand color.
 * Light mode: #E5E7EB (border gray) with shimmer effect
 * Dark mode: #1E1E38 (muted dark) with shimmer effect
 *
 * Supports optional shimmer animation (gradient sweep) for premium feel.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
