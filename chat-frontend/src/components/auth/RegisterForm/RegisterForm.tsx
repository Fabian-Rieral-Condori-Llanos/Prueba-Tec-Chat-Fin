"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { User, Mail, Lock, Phone, AlertCircle } from "lucide-react";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/Button/Button";
import { useAuth } from "@/src/hooks/useAuth";
import { registerSchema, RegisterFormData } from "@/src/lib/utils/validators";

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });
    } catch (error) {
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join ChatApp today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            icon={User}
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+1234567890"
            icon={Phone}
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              icon={Lock}
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-sm text-primary-600 hover:text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary-600 hover:underline"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}