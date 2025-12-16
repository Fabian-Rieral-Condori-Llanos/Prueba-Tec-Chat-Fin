"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">ChatApp</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-primary-600 transition"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-gray-600 hover:text-primary-600 transition"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-gray-600 hover:text-primary-600 transition"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}