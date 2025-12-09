"use client";
import React from "react";
import { Benefits } from "@/components/landing/benefits";
import { BentoBox } from "@/components/landing/bento-box";
import { DashboardView } from "@/components/landing/dashboard-view";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";

const HomePage = () => {
  return (
    <section className="flex flex-col items-center">
      <Navbar />
      <Hero />
      <DashboardView />
      <BentoBox />
      <Benefits />
      <Footer />
    </section>
  );
};

export default HomePage;
