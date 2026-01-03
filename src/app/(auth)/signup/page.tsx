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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signupSchema, SignupFormData } from "@/app/(auth)/lib/auth.schemas";
import { signup } from "@/app/(auth)/lib/auth.actions";
import { ModeToggle } from "@/components/mode-toggle";

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  async function onSubmit(data: SignupFormData) {
    startTransition(async () => {
      const result = await signup(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Account created successfully");
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
          <div className="relative w-20 h-20 mb-2 animate-in spin-in-12 duration-1000">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Nepal.svg"
              alt="Emblem of Nepal"
              fill
              className="object-contain"
            />
          </div>
          <CardTitle className="text-xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join the Health Intelligence Grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a...</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="provider">Healthcare Provider</SelectItem>
                        <SelectItem value="ministry">Ministry Official</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isPending}
              >
                {isPending ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
