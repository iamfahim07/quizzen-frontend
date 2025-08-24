import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { Brain, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth, type GoogleAuthInput } from "@/api/use-auth";

import { SpinnerLoader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuthStore } from "@/hooks/use-auth-store";
import { useSignupQueryState } from "@/hooks/use-signup-query-state";

import { cn } from "@/lib/utils";

interface LoginInputField {
  username: string;
  password: string;
}

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterInputField = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const navigate = useNavigate();

  const { loginMutation, registerMutation, googleAuthMutation } = useAuth();
  const { setUser } = useAuthStore();

  const { isOpen, open, close } = useSignupQueryState();

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDisabled = loginMutation.isPending || registerMutation.isPending;

  const loginForm = useForm<LoginInputField>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<RegisterInputField>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (credentials: LoginInputField) => {
    const { data } = await loginMutation.mutateAsync(credentials);
    if (data?.username) {
      setUser(data);
      navigate({ to: "/" });
    }
  };

  const onSignupSubmit = async (credentials: RegisterInputField) => {
    const { data } = await registerMutation.mutateAsync(credentials);
    if (data?.username) {
      setUser(data);
      navigate({ to: "/" });
    }
  };

  return (
    <main className="fade-in animate-in duration-500">
      <div className="flex flex-col justify-center px-6 py-12 lg:px-8 fade-in">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            QuizZen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test your knowledge and challenge yourself!
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Tabs
            defaultValue="login"
            value={isOpen ? "signup" : "login"}
            onValueChange={() => (isOpen ? close() : open())}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="login"
                className="cursor-pointer"
                disabled={isDisabled}
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="cursor-pointer"
                disabled={isDisabled}
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                            placeholder="Enter your username"
                            {...field}
                            autoComplete="username"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <div className="text-sm">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-semibold"
                            >
                              Forgot password?
                            </Button>
                          </div>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className="bg-white shadow px-3 py-5 pr-10 focus-visible:ring-[1px]"
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="current-password"
                              required
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                              onClick={() =>
                                setShowLoginPassword(!showLoginPassword)
                              }
                              aria-label={
                                showLoginPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showLoginPassword ? (
                                <EyeOff className="size-5 text-gray-400" />
                              ) : (
                                <Eye className="size-5 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 cursor-pointer"
                    disabled={isDisabled}
                  >
                    {loginMutation.isPending && (
                      <SpinnerLoader className="text-white" />
                    )}
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                            placeholder="John Doe"
                            {...field}
                            autoComplete="fullName"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                            placeholder="johndoe"
                            {...field}
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className="bg-white shadow px-3 py-5 pr-10 focus-visible:ring-[1px]"
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="new-password"
                              // {...signupForm.register("password", {
                              //   required: "Password is required",
                              //   minLength: {
                              //     value: 6,
                              //     message: "At least 6 chars",
                              //   },
                              // })}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                              onClick={() =>
                                setShowSignupPassword(!showSignupPassword)
                              }
                              aria-label={
                                showSignupPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showSignupPassword ? (
                                <EyeOff className="size-5 text-gray-400" />
                              ) : (
                                <Eye className="size-5 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className="bg-white shadow px-3 py-5 pr-10 focus-visible:ring-[1px]"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="new-password"
                              // {...signupForm.register("confirmPassword", {
                              //   required: "Confirm Password is required",
                              //   validate: (value) =>
                              //     value === signupForm.getValues("password") ||
                              //     "Passwords must match",
                              //   minLength: {
                              //     value: 6,
                              //     message: "At least 6 chars",
                              //   },
                              // })}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="size-5 text-gray-400" />
                              ) : (
                                <Eye className="size-5 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 cursor-pointer"
                    disabled={isDisabled}
                  >
                    {registerMutation.isPending && (
                      <SpinnerLoader className="text-white" />
                    )}
                    {registerMutation.isPending
                      ? "Creating account..."
                      : "Create account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-gray-50 px-6 text-gray-600">
                  Or continue with
                </span>
              </div>
            </div>

            <div
              className={cn(
                "mt-6 flex justify-center items-center",
                isDisabled &&
                  "pointer-events-none cursor-not-allowed opacity-40"
              )}
            >
              <GoogleLogin
                text={isOpen ? "signup_with" : "signin_with"}
                onSuccess={async (credentialResponse) => {
                  console.log(credentialResponse);

                  const { data } = await googleAuthMutation.mutateAsync(
                    credentialResponse as GoogleAuthInput
                  );

                  setUser(data);
                  navigate({ to: "/" });
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
