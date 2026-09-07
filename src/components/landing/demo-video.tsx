"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Play, ExternalLink } from "lucide-react";
import { staggerContainer, staggerItem } from "./motion";

interface DemoConfig {
  videoUrl: string;
  thumbnailUrl: string;
  updatedAt: string;
  version: string;
}

export function DemoVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [config, setConfig] = useState<DemoConfig | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch("/demo-config.json")
      .then((r) => r.json())
      .then((data) => {
        if (data.videoUrl) setConfig(data);
      })
      .catch(() => {});
  }, []);

  if (!config?.videoUrl) return null;

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 bg-gradient-to-b from-background via-primary/5 to-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center"
        >
          <motion.p
            variants={staggerItem}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            See It In Action
          </motion.p>
          <motion.h2
            variants={staggerItem}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            Watch the Phikila demo
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A quick walkthrough of the platform — from login to attendance,
            fees, exams, and more.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">
                Phikila Demo — {new Date(config.updatedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Video player */}
            <div className="relative aspect-video bg-black">
              {playing ? (
                <video
                  src={config.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="w-full h-full relative group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <img
                    src={config.thumbnailUrl}
                    alt="Phikila Demo Video"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-all group-hover:scale-110">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                      <span className="text-white font-semibold text-sm">
                        Watch Demo
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* CTA below video */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a href="/demo" className="text-sm font-semibold text-primary hover:underline">
              Try the demo yourself →
            </a>
            <a
              href="https://calendly.com/twistedoliver211fs/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Book a live walkthrough
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
