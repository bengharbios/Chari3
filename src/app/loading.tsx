export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl gradient-navy animate-pulse" />
        <div className="space-y-2 text-center">
          <div className="h-4 w-32 rounded bg-muted animate-pulse mx-auto" />
          <div className="h-3 w-24 rounded bg-muted/50 animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
