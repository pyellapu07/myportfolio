"use client";

import { RecruiterProvider } from "@/lib/recruiter-context";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ImpactMetrics from "@/components/ImpactMetrics";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Timeline from "@/components/Timeline";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatBar from "@/components/ChatBar";
import RecruiterSplash from "@/components/RecruiterSplash";
import CustomCursor from "@/components/CustomCursor";
import TestimonialToast from "@/components/TestimonialToast";

export default function Home() {
  return (
    <RecruiterProvider>
      <CustomCursor />
      <TestimonialToast />
      <RecruiterSplash />
      <Header initialDark />
      <main id="main">
        <Hero />
        <ImpactMetrics />
        <Projects />
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
