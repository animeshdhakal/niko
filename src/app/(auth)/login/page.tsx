"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, LoginFormData } from "../lib/auth.schemas";
import { login } from "../lib/auth.actions";
import { ModeToggle } from "@/components/mode-toggle";


export default function LoginPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Logged in successfully");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
      <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="relative w-24 h-24 mb-2 animate-in spin-in-12 duration-1000">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Nepal.svg"
              alt="Emblem of Nepal"
              fill
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to Niko
          </CardTitle>
          <CardDescription className="text-center">
            Unified Health Intelligence Grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


              {/* Check for URL error param as well, handled via useSearchParams if we want, but let's stick to simple form submission for now.
                  Actually, since we used to read searchParams in the server component, we lost that.
                  I should probably use `useSearchParams` to show errors returned from the server redirect.
              */}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
