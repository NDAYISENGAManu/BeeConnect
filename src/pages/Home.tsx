import React, { useState } from "react";
import Abouts from "../component/About";
import Contacts from "../component/Contacts";
import Footer from "../component/Footer";
import Header from "../component/Header";
import HowItWorks from "../component/HowItWorks";
import Impacts from "../component/Impact";
import LoginForm from "../component/LoginForm";
import { useAuth } from "../context/AuthContext";

// Define a type for the sections keys
type SectionKey = "about" | "ourApproach" | "impacts" | "contacts";

const sections: Record<SectionKey, JSX.Element> = {
  about: <Abouts />,
  ourApproach: <HowItWorks />,
  impacts: <Impacts />,
  contacts: <Contacts />,
};
const Home: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const { showLoginForm, setShowLoginForm } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSectionClick = (section: SectionKey) => {
    setShowLoginForm(false);
    setActiveSection(section);
  };

  const handleLoginClick = () => {
    setActiveSection(null);
    setShowLoginForm(true);
  };

  const toggleDashboardSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="w-full font-roboto">
      <Header
        onLoginClick={handleLoginClick}
        onAboutsClick={() => handleSectionClick("about")}
        onContact={() => handleSectionClick("contacts")}
        onHowItWorks={() => handleSectionClick("ourApproach")}
        onImpact={() => handleSectionClick("impacts")}
        toggleDashboardSidebar={toggleDashboardSidebar}
      />
      <section className="section-bg flex flex-col md:flex-row justify-between font-roboto top-96 md:top-0 h-[100%] md:h-screen px-5 md:px-20 py-20 md:py-56">
        {/* Section key list, hidden on small screens */}
        <div className="hidden md:flex w-full md:w-[30%] lg:w-[20%] text-xl font-bold flex-col space-y-10">
          {Object.keys(sections).map((key) => (
            <div
              key={key}
              className={`text-xl font-bold flex-col rounded-md cursor-pointer ${
                activeSection === key
                  ? "text-[#0A540E] bg-white w-full rounded-r-none"
                  : "text-[#0A540E] bg-white w-[95%]"
              } py-10 pl-0 lg:pl-10`}
              onClick={() => handleSectionClick(key as SectionKey)}
            >
              <div className="flex flex-col items-start px-5 transition-all duration-300">
                <label>
                  <span>
                    {key
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/^\w/, (c) => c.toUpperCase())}{" "}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Content area */}
        <div
          className="w-full md:w-[70%] lg:w-[80%] rounded-l-md h-fit text-black text-xl font-bold flex flex-col items-center rounded-r-3xl mt-10 md:mt-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255, 255, 255, 6), rgba(255, 255, 255, 0.4))",
          }}
        >
          {showLoginForm && <LoginForm />}
          {!showLoginForm && activeSection && sections[activeSection]}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
