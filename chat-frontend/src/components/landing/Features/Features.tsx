import {
  MessageSquare,
  Image,
  Video,
  Shield,
  Smartphone,
  Clock,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: MessageSquare,
      title: "Rich Text Messages",
      description: "Send formatted text with emojis and reactions",
    },
    {
      icon: Image,
      title: "Media Sharing",
      description: "Share photos, videos, and files instantly",
    },
    {
      icon: Video,
      title: "Video Calls",
      description: "High-quality video and voice calling",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption for all messages",
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Works on web, mobile, and desktop",
    },
    {
      icon: Clock,
      title: "Message History",
      description: "Access your chat history anytime",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for seamless communication
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition"
            >
              <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}