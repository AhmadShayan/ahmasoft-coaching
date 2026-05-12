import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import WhoItsFor from "@/components/sections/WhoItsFor";
import SprintOffer from "@/components/sections/SprintOffer";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <WhoItsFor />
      <SprintOffer />
      <HowItWorks />
      <Testimonials />
      <About />
      <FAQ />
      <FinalCTA />
    </>
  );
}
