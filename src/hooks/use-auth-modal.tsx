import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSignupQueryState } from "@/hooks/use-signup-query-state";

interface UseAuthModalFunction {
  AuthModal: () => React.JSX.Element;
  openAuthModal: () => void;
}

export const useAuthModal = (): UseAuthModalFunction => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { open: openSignUpPage } = useSignupQueryState();

  const openAuthModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogIn = () => {
    navigate({ to: "/auth" });
    handleClose();
  };

  const handleSignUp = () => {
    navigate({ to: "/auth" });
    openSignUpPage();
    handleClose();
  };

  const AuthModal = () => (
    <ResponsiveModal
      open={open}
      onOpenChange={handleClose}
      className="sm:max-w-md h-fit"
    >
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="pt-2">
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-medium">
              Join and start Playing
            </CardTitle>
            <CardDescription className="mt-2">
              Log in or create a free account to start Playing quizzes
            </CardDescription>
          </CardHeader>
          <div className="w-full mt-10 flex flex-col justify-center items-center gap-4">
            <Button
              onClick={handleLogIn}
              variant="outline"
              className="w-full cursor-pointer"
            >
              Log in
            </Button>
            <Button onClick={handleSignUp} className="w-full cursor-pointer">
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return { AuthModal, openAuthModal };
};
