import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogIn } from "lucide-react";

import { SpinnerLoader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/api/use-auth";
import { useAuthStore } from "@/hooks/use-auth-store";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showProfile?: boolean;
  rightContent?: React.ReactNode;
}

export default function Header({
  title,
  showBackButton = false,
  onBackClick,
  showProfile = false,
  rightContent,
}: HeaderProps) {
  const navigate = useNavigate();

  const { logoutMutation } = useAuth();
  const { user, reSetUser, isLoading } = useAuthStore();

  return (
    <header className="shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="mr-4 text-gray-500 hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link
            to="/"
            className="flex justify-center items-center gap-2 hover:scale-105 transition"
          >
            <img src="/home.png" alt="home" className="w-10 h-10" />
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </Link>
        </div>

        {isLoading && <SpinnerLoader />}

        {!user && !isLoading && (
          <Button
            variant="outline"
            className="flex justify-center items-center space-x-2 cursor-pointer"
            onClick={() => navigate({ to: "/auth" })}
          >
            <LogIn className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}

        {showProfile && user && !isLoading && (
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={`${user.fullName}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary">
                    <span className="font-semibold">
                      {user.fullName?.charAt(0) ||
                        user.username?.charAt(0) ||
                        "?"}
                    </span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  logoutMutation.mutateAsync();
                  reSetUser();
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
