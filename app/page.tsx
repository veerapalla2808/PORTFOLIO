// app/page.tsx
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Briefing from "@/components/cockpit/Briefing";
import ConsoleBlock from "@/components/cockpit/ConsoleBlock";
import NavPanel from "@/components/cockpit/NavPanel";
import Cockpit from "@/components/cockpit/Cockpit";
import CockpitMobileNav from "@/components/cockpit/CockpitMobileNav";
import TravelGap from "@/components/journey/TravelGap";

export default function Home() {
  return (
    <>
      <NavPanel />
      <CockpitMobileNav />
      <Cockpit />
      <main id="main-content" tabIndex={-1}>
        <Briefing />
        <TravelGap />
        <ConsoleBlock id="about"><About /></ConsoleBlock>
        <TravelGap />
        <ConsoleBlock id="skills"><Skills /></ConsoleBlock>
        <TravelGap />
        <ConsoleBlock id="experience"><Experience /></ConsoleBlock>
        <TravelGap />
        <ConsoleBlock id="projects"><Projects /></ConsoleBlock>
        <TravelGap />
        <ConsoleBlock id="education"><Education /></ConsoleBlock>
        <TravelGap />
        <ConsoleBlock id="blog"><Blog /></ConsoleBlock>
        <TravelGap />
        <ConsoleBlock id="contact"><Contact /><Footer /></ConsoleBlock>
      </main>
    </>
  );
}
