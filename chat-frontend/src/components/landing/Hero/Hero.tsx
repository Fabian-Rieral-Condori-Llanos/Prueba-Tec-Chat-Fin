import Link from "next/link";
import { MessageCircle, Users, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Connect with Friends
          <span className="block text-primary-600">Anytime, Anywhere</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Experience seamless messaging with real-time chat, group
          conversations, and rich media sharing. Built for modern
          communication.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Start Chatting Free
          </Link>
          <Link
            href="#features"
            className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            Learn More
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
            <MessageCircle className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Messaging</h3>
            <p className="text-gray-600">
              Instant message delivery with WebSocket technology
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
            <Users className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Group Chats</h3>
            <p className="text-gray-600">
              Create groups and chat with multiple friends
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
            <Zap className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fast & Secure</h3>
            <p className="text-gray-600">
              End-to-end encryption and blazing fast performance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}