import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { WhyJuvraSection } from "./components/WhyJuvraSection";
import { OpportunitiesSection } from "./components/OpportunitiesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { AICopilotSection } from "./components/AICopilotSection";
import { InfrastructureSection } from "./components/InfrastructureSection";
import { DashboardSection } from "./components/DashboardSection";
import { UseCasesSection } from "./components/UseCasesSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div
      className="min-h-screen antialiased"
      style={{
        background: "#060816",
        color: "#eef2ff",
        fontFamily: "Inter, system-ui, sans-serif",
        scrollBehavior: "smooth",
      }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <WhyJuvraSection />
        <OpportunitiesSection />
        <HowItWorksSection />
        <AICopilotSection />
        <InfrastructureSection />
        <DashboardSection />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
