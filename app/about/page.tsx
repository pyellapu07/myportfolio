"use client";

import { RecruiterProvider } from "@/lib/recruiter-context";
import Header from "@/components/Header";
import About from "@/components/About";
import Footer from "@/components/Footer";
import ChatBar from "@/components/ChatBar";
import CustomCursor from "@/components/CustomCursor";

export default function AboutPage() {
  return (
    <RecruiterProvider>
      <CustomCursor />
      <Header initialDark />
      <main id="main" className="pt-16">
        <About />
      </main>
      <Footer />
      <ChatBar />
    </RecruiterProvider>
  );
}
