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
import LandingLoader from "@/components/landing/landing-loader";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <LandingLoader />;
  }

  if (session) {
    return null;
  }
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