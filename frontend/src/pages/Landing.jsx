import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Hero from '../components/landing/Hero.jsx';
import BeforeAfter from '../components/landing/BeforeAfter.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import SocraticSimulator from '../components/landing/SocraticSimulator.jsx';
import PersonaTabs from '../components/landing/PersonaTabs.jsx';
import FaqSection from '../components/landing/FaqSection.jsx';
import CtaBanner from '../components/landing/CtaBanner.jsx';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1E1C1E] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Glassmorphism Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero />
        <BeforeAfter />
        <HowItWorks />
        <SocraticSimulator />
        <PersonaTabs />
        <FaqSection />
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
