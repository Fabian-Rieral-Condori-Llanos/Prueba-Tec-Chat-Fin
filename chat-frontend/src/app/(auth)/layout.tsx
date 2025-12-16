import { ReactNode } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="absolute top-0 left-0 right-0 p-6">
        <Link href="/" className="flex items-center space-x-2">
          <MessageCircle className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold text-gray-900">ChatApp</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        {children}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-gray-600">
        © 2024 ChatApp. All rights reserved.
      </div>
    </div>
  );
}