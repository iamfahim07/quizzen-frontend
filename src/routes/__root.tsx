import { GoogleOAuthProvider } from "@react-oauth/google";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { z } from "zod";

import { AIQuizModal } from "@/components/ai-quiz-modal";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

import { InitializeAuthStore } from "@/hooks/use-auth-store";
import "../App.css";

const searchSchema = z.object({
  aiQuizDataId: z.string().optional(),
  source: z.string().optional(),
});

export const Route = createRootRoute({
  validateSearch: searchSchema,
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <GoogleOAuthProvider
        clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}
      >
        <NuqsAdapter>
          <InitializeAuthStore />
          <Header title="QuizZen" showProfile />
          <Toaster
            position="bottom-center"
            richColors
            toastOptions={{
              style: {
                fontSize: "18px",
              },
            }}
          />
          <AIQuizModal />
          <Outlet />
        </NuqsAdapter>
      </GoogleOAuthProvider>
    </div>
  );
}
