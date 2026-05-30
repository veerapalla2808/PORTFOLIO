// app/page.tsx
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/ui/SectionReveal";
import SideStrip from "@/components/SideStrip";
import Sector from "@/components/galaxy/Sector";

export default function Home() {
  return (
    <>
      <SideStrip />
      <Navbar />
      <div className="page-shell">
        <main id="main-content" tabIndex={-1}>
          <Sector id="hero"><Hero /></Sector>
          <Sector id="about"><SectionReveal variant="fold"><About /></SectionReveal></Sector>
          <Sector id="skills"><SectionReveal variant="sweep-left"><Skills /></SectionReveal></Sector>
          <Sector id="experience"><SectionReveal variant="curtain"><Experience /></SectionReveal></Sector>
          <Sector id="projects"><SectionReveal variant="zoom"><Projects /></SectionReveal></Sector>
          <Sector id="education"><SectionReveal variant="sweep-right"><Education /></SectionReveal></Sector>
          <Sector id="blog"><SectionReveal variant="fold"><Blog /></SectionReveal></Sector>
          <Sector id="contact"><SectionReveal variant="blur-in"><Contact /></SectionReveal></Sector>
        </main>
        <Footer />
      </div>
    </>
  );
}
