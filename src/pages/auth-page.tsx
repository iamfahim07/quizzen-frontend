import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuth, type GoogleAuthInput } from "@/api/use-auth";

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

import { useSignupQueryState } from "@/hooks/use-signup-query-state";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/hooks/use-auth-store";
// import { z } from "zod";

interface LoginInputField {
  username: string;
  password: string;
}

interface RegisterInputField extends LoginInputField {
  fullName: string;
  email: string;
  confirmPassword: string;
}

export default function AuthPage() {
  const navigate = useNavigate();

  const { loginMutation, registerMutation, googleAuthMutation } = useAuth();
  const { setUser } = useAuthStore();

  const { isOpen, open, close } = useSignupQueryState();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm({
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
    const { password, confirmPassword, ...userData } = credentials;

    if (password !== confirmPassword) {
      return;
    }

    try {
      const { data } = await registerMutation.mutateAsync({
        password,
        ...userData,
      });
      if (data?.username) {
        setUser(data);
        navigate({ to: "/" });
      }
    } catch {
      toast.error("Failed to Signup");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 fade-in">
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
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-6">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  // control={loginForm.control}
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
                  // control={loginForm.control}
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
                        <Input
                          className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          autoComplete="current-password"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loginMutation.isPending}
                >
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
                  // control={signupForm.control}
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
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // control={signupForm.control}
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
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // control={signupForm.control}
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
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          autoComplete="new-password"
                          {...signupForm.register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message: "At least 6 chars",
                            },
                          })}
                          required
                        />
                        {/* {errors.password && <p>{errors.password.message}</p>} */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white shadow px-3 py-5 focus-visible:ring-[1px]"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          autoComplete="new-password"
                          {...signupForm.register("confirmPassword", {
                            required: "Confirm Password is required",
                            validate: (value) =>
                              value === signupForm.getValues("password") ||
                              "Passwords must match",
                            // minLength: {
                            //   value: 6,
                            //   message: "At least 6 chars",
                            // },
                          })}
                          required
                        />
                        {/* {errors.confirmPassword && (
                          <p>{errors.confirmPassword.message}</p>
                        )} */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={registerMutation.isPending}
                >
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

          <div className="mt-6 flex justify-center items-center">
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
  );
}
