"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Github, MapPin } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { SITE } from "@/lib/constants";

const contactLinks = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: SITE.linkedin,
    color: "#6366F1",
  },
  {
    icon: Github,
    label: "GitHub",
    href: SITE.github,
    color: "#333",
  },
  {
    icon: Mail,
    label: "Email",
    href: `mailto:${SITE.email}`,
    color: "#FF5210",
  },
];

export default function Contact() {
  return (
    <SectionWrapper id="contact" alternate>
      <div className="mx-auto max-w-xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
        >
          Contact
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold text-text md:text-4xl"
        >
          Let&apos;s Connect
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-text-secondary"
        >
          I&apos;m currently open to full-time opportunities in product design,
          UX research, and data science. Let&apos;s talk.
        </motion.p>

        {/* Email (primary CTA) */}
        <motion.a
          href={`mailto:${SITE.email}`}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-white px-8 py-4 text-lg font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
        >
          <Mail size={22} />
          {SITE.email}
        </motion.a>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          {contactLinks.map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-border/60"
            >
              <Icon size={15} style={{ color }} />
              {label}
            </a>
          ))}
        </motion.div>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-1.5 font-mono text-xs text-text-muted"
        >
          <MapPin size={12} />
          {SITE.location}
        </motion.p>
      </div>
    </SectionWrapper>
  );
}
