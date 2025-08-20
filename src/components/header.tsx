import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Settings } from "lucide-react";

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
  showProfile?: boolean;
}

export default function Header({ title, showProfile = false }: HeaderProps) {
  const navigate = useNavigate();

  const { logoutMutation } = useAuth();
  const { user, reSetUser, isLoading } = useAuthStore();

  return (
    <header className="shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
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
            className="flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => navigate({ to: "/auth" })}
          >
            <LogIn className="size-4 sm:hidden" />
            <span className="px-2 hidden sm:inline">Login</span>
          </Button>
        )}

        {user && !isLoading && (
          <div className="flex justify-center items-center gap-14">
            {user && user.role === "admin" && !isLoading && (
              <Button
                variant="outline"
                className="py-5 flex justify-center items-center gap-2 cursor-pointer"
                onClick={() => navigate({ to: "/admin-dashboard" })}
              >
                <Settings className="size-4" />
                <span className="hidden sm:inline text-lg">
                  Admin Dashboard
                </span>
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
          </div>
        )}
      </div>
    </header>
  );
}
