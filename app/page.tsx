// app/page.tsx
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/ui/SectionReveal";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <SectionReveal><About /></SectionReveal>
        <SectionReveal><Skills /></SectionReveal>
        <SectionReveal><Experience /></SectionReveal>
        <SectionReveal><Projects /></SectionReveal>
        <SectionReveal><Education /></SectionReveal>
        <SectionReveal><Contact /></SectionReveal>
      </main>
      <Footer />
    </>
  );
}
