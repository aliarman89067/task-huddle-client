"use client";
import { Hero } from "@/components/landing/hero";
import { MaxWidthWrapper } from "@/components/landing/max-width-wrapper";
import { Navbar } from "@/components/landing/navbar";
import React from "react";

const HomePage = () => {
  return (
    <section className="flex flex-col items-center">
      <Navbar />
      <Hero />
    </section>
  );
};

export default HomePage;
