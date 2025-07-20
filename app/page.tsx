import HomeHeader from "./components/HomeHeader";
import HomeMainContent from "./components/HomeMainContent";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <HomeHeader />
      <HomeMainContent />
    </div>
  );
}
