"use client";

import { RecruiterProvider } from "@/lib/recruiter-context";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ImpactMetrics from "@/components/ImpactMetrics";
import About from "@/components/About";
import Projects from "@/components/Projects";
import EsportsFeature from "@/components/EsportsFeature";
import Skills from "@/components/Skills";
import Timeline from "@/components/Timeline";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatBar from "@/components/ChatBar";
import RecruiterSplash from "@/components/RecruiterSplash";
import CustomCursor from "@/components/CustomCursor";
import TestimonialToast from "@/components/TestimonialToast";
import OnboardingTour from "@/components/OnboardingTour";

export default function Home() {
  return (
    <RecruiterProvider>
      <CustomCursor />
      {/* <TestimonialToast /> */}
      <OnboardingTour />
      <RecruiterSplash />
      <Header initialDark />
      <main id="main">
        <Hero />
        <ImpactMetrics />
        <Projects />
        <EsportsFeature />
        <About />
        <Skills />
        <Timeline />
        <Contact />
      </main>
      <Footer />
      <ChatBar />
    </RecruiterProvider>
  );
}
