import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function ErrorComponent({
  title = "Something went wrong",
  message = "We encountered an error while loading this content.",
  onRetry,
  showRetry = true,
  isLoading = false,
}: ErrorComponentProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-8 px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center p-3 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-lg text-gray-600 max-w-sm">{message}</p>
          </div>

          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="mt-4 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateComponentProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyStateComponent({
  title = "No data found",
  message = "There's nothing to show here yet.",
  icon,
}: EmptyStateComponentProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-8 px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {icon && <div className="p-3 rounded-full bg-gray-100">{icon}</div>}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 max-w-sm">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
