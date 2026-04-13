"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Agents from "@/components/landing/agents";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import Cta from "@/components/landing/cta";
import Footer from "@/components/landing/footer";
import ScrollReveal from "@/components/landing/scroll-reveal";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [isPending, session, router]);

  // While auth state is resolving, show nothing to prevent landing-page flicker
  if (isPending) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(255,255,255,0.15)",
            borderTopColor: "#7c3aed",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Signed-in user — redirect is in-flight, render nothing to avoid flash
  if (session) {
    return null;
  }

  // Signed-out user — render the landing page as-is
  return (
    <main>
      <Navbar />
      <Hero />
      <Agents />
      <Features />
      <HowItWorks />
      <Cta />
      <Footer />
      <ScrollReveal />
    </main>
  );
}