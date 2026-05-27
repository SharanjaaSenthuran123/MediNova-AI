import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RoadmapSection } from "@/components/homepage/RoadmapSection";

export default function RoadmapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <RoadmapSection />
      </main>
      <Footer />
    </div>
  );
}
