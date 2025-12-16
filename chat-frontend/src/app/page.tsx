import { Navbar } from "@/src/components/common/Navbar/Navbar";
import { Hero } from "@/src/components/landing/Hero/Hero";
import { Features } from "@/src/components/landing/Features/Features";
import { Footer } from "@/src/components/landing/Footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}