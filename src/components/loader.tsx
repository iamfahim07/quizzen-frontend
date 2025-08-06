import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};

interface SpinnerLoaderProps {
  className?: string;
}

export const SpinnerLoader = ({ className }: SpinnerLoaderProps) => {
  return (
    <div className="flex items-center justify-center">
      <Loader
        className={cn("size-6 animate-spin text-muted-foreground", className)}
      />
    </div>
  );
};
