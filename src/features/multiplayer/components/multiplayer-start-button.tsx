import { useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export const MultiplayerStartButton = () => {
  const navigate = useNavigate();

  const handleStartChallengeClick = () => {
    navigate({
      to: "/multiplayer",
    });
  };

  return (
    <div className="mt-8 bg-white rounded-xl p-6 border border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Challenge Friends</h3>
            <p className="text-muted-foreground">
              Compete in real-time multiplayer quizzes
            </p>
          </div>
        </div>
        <Button
          className="text-base cursor-pointer"
          size="lg"
          onClick={handleStartChallengeClick}
        >
          Start Challenge
        </Button>
      </div>
    </div>
  );
};
