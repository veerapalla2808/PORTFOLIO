// app/page.tsx
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Landing from "@/components/journey/Landing";
import StationBlock from "@/components/journey/StationBlock";
import TravelGap from "@/components/journey/TravelGap";
import StationDots from "@/components/journey/StationDots";
import MobileNav from "@/components/journey/MobileNav";
import TopHud from "@/components/journey/TopHud";

export default function Home() {
  return (
    <>
      <TopHud />
      <StationDots />
      <MobileNav />
      <main id="main-content" tabIndex={-1}>
        <Landing />
        <TravelGap />
        <StationBlock id="about"><About /></StationBlock>
        <TravelGap />
        <StationBlock id="skills"><Skills /></StationBlock>
        <TravelGap />
        <StationBlock id="experience"><Experience /></StationBlock>
        <TravelGap />
        <StationBlock id="projects"><Projects /></StationBlock>
        <TravelGap />
        <StationBlock id="education"><Education /></StationBlock>
        <TravelGap />
        <StationBlock id="blog"><Blog /></StationBlock>
        <TravelGap />
        <StationBlock id="contact"><Contact /><Footer /></StationBlock>
      </main>
    </>
  );
}
