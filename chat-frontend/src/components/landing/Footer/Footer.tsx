import Link from "next/link";
import { GithubIcon, Linkedin, MessageCircle, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">ChatApp</span>
            </div>
            <p className="text-gray-400">
              Modern messaging for modern teams
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
            <a></a>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
                <a
                href="#"
                className="text-gray-400 hover:text-white transition"
                >
                <GithubIcon className="h-6 w-6" />
                </a>
                <a
                href="#"
                className="text-gray-400 hover:text-white transition"
                >
                    <Twitter className="h-6 w-6" />
                </a>
                <a
                href="#"
                className="text-gray-400 hover:text-white transition"
                >
                <Linkedin className="h-6 w-6" />
                </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ChatApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
