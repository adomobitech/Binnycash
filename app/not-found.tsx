'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070B] text-white">

      {/* Hide navbar + ticker */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #global-ticker-wrapper {
              display: none !important;
            }

            #main-navbar-wrapper {
              display: none !important;
            }
          `,
        }}
      />

      {/* ================= BACKGROUND ================= */}

      {/* Main purple glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/10 blur-[130px]" />

      {/* Small green glow */}
      <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-[#00E57A]/[0.035] blur-[120px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating dots */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[12%] top-[25%] h-1.5 w-1.5 rounded-full bg-white/30" />
        <span className="absolute left-[20%] top-[70%] h-1 w-1 rounded-full bg-[#8B5CF6]/60" />
        <span className="absolute right-[15%] top-[30%] h-1.5 w-1.5 rounded-full bg-[#00E57A]/60 shadow-[0_0_15px_#00E57A]" />
        <span className="absolute right-[10%] top-[72%] h-1 w-1 rounded-full bg-white/25" />
      </div>

      {/* ================= CONTENT ================= */}

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5">

        <div className="relative flex w-full max-w-3xl flex-col items-center text-center">

          {/* Floating spark */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute right-[17%] top-[4%] hidden sm:block"
          >
            <Sparkles className="h-7 w-7 text-[#8B5CF6]/70" />
          </motion.div>

          {/* ================= 404 ================= */}

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              ease: 'easeOut',
            }}
            className="relative"
          >

            {/* Glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/10 blur-[90px]" />

            <h1
              className="
                relative
                select-none
                text-[120px]
                font-black
                leading-[0.8]
                tracking-[-0.08em]
                sm:text-[170px]
                md:text-[230px]
              "
            >
              <span className="bg-gradient-to-b from-white via-[#B99AFF] to-[#5425A7] bg-clip-text text-transparent drop-shadow-[0_20px_50px_rgba(139,92,246,0.18)]">
                404
              </span>
            </h1>
          </motion.div>

          {/* ================= MESSAGE ================= */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="mt-10"
          >
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Page not found
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#858996] sm:text-[15px]">
              The page you're looking for doesn't exist or may have been
              moved somewhere else.
            </p>
          </motion.div>

          {/* ================= HOME ICON BUTTON ================= */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            className="mt-8"
          >
            <Link href="/">
              <motion.div
                whileHover={{
                  scale: 1.04,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                className="
                  group
                  flex
                  h-12
                  items-center
                  gap-2.5
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.045]
                  px-3
                  pr-5
                  shadow-[0_10px_35px_rgba(0,0,0,0.25)]
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:border-[#8B5CF6]/40
                  hover:bg-white/[0.07]
                  hover:shadow-[0_10px_35px_rgba(139,92,246,0.18)]
                "
              >

                {/* Icon box */}
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.06]
                    transition-all
                    duration-300
                    group-hover:border-[#8B5CF6]/40
                    group-hover:bg-[#8B5CF6]/10
                  "
                >
                  <Home
                    className="
                      h-4
                      w-4
                      text-white/70
                      transition-colors
                      duration-300
                      group-hover:text-[#A78BFA]
                    "
                  />
                </span>

                <span className="text-xs font-bold text-white/70 transition-colors group-hover:text-white">
                  Back to home
                </span>

              </motion.div>
            </Link>
          </motion.div>

          {/* Tiny decorative line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 70, opacity: 1 }}
            transition={{
              delay: 0.7,
              duration: 0.8,
            }}
            className="mt-12 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent"
          />

        </div>
      </section>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#07070B] to-transparent" />

    </main>
  );
}