import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { CampusShowcase } from "@/components/site/CampusShowcase";
import { AdmissionsDashboard } from "@/components/site/AdmissionsDashboard";
import { HistoryTimeline } from "@/components/site/HistoryTimeline";
import { NewsHub } from "@/components/site/NewsHub";
import { Footer } from "@/components/site/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <CampusShowcase />
        <AdmissionsDashboard />
        <HistoryTimeline />
        <NewsHub />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
