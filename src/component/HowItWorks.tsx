import React, { useState } from "react";
import mobilization from "../assets/mobilization.svg";
import inspiration from "../assets/inspiration.svg";
import profiling from "../assets/profiling.svg";
import skilling from "../assets/skilling.svg";
const HowItWorks: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const handleSectionClick = (index: number) => {
    setActiveSection((prev) => (prev === index ? null : index));
  };
  return (
    // <div className="flex flex-col md:flex-row rounded-r-3xl md:h-[100%] lg:h-[550px]">
    <div className="flex flex-col md:flex-row rounded-r-3xl">
      <div className="text-center w-full px-10 md:px-50 font-normal text-gray-600 py-4 md:p-8 overflow-hidden">
        <div>
          <h1 className="text-2xl text-center font-bold text-[#0E743F]">
            OUR APPROACH
          </h1>
        </div>
        <div className="overflow-auto">
          <div className="flex flex-wrap justify-between mt-4 gap-3 text-[#0E743F] text-center">
            <div
              className="flex-1 px-4 py-4 border-2 border-transparent rounded-lg text-center mb-4 relative flex flex-col justify-center items-center"
              onClick={() => handleSectionClick(0)}
            >
              <div
                className="absolute inset-0 rounded-lg border-2 border-transparent bg-clip-padding border-opacity-50"
                style={{
                  borderImage:
                    "linear-gradient(180deg, #0E743F 0%, #C7DA1A 100%)",
                  borderImageSlice: 1,
                }}
              />
              <img
                src={mobilization}
                alt="Logo"
                className={`${activeSection === 0 ? "w-10" : ""} mb-2`}
              />
              <h2
                className={`${
                  activeSection === 0 ? "text-md" : " text-lg "
                } font-semibold`}
              >
                Mobilization and Screening
              </h2>
              <p
                className={`text-black text-left text-sm ${
                  activeSection === 0
                    ? "md:block sm:block"
                    : " md:hidden sm:hidden"
                } lg:block`}
              >
                We begin by identifying the target group and mobilizing
                potential beneficiaries through various outreach channels.
                Interested participants are screened against a qualification
                matrix to ensure eligibility. Qualified candidates are then
                registered on our online platform, streamlining their access to
                the program.
              </p>
            </div>
            <div
              className="flex-1 px-4 py-4 border-2 border-transparent rounded-lg text-center mb-4 relative flex flex-col justify-center items-center"
              onClick={() => handleSectionClick(3)}
            >
              <div
                className="absolute inset-0 rounded-lg border-2 border-transparent bg-clip-padding border-opacity-50"
                style={{
                  borderImage:
                    "linear-gradient(180deg, #0E743F 0%, #C7DA1A 100%)",
                  borderImageSlice: 1,
                }}
              />

              <img
                src={skilling}
                alt="Logo"
                className={`${activeSection === 0 ? "w-10" : ""} mb-2`}
              />
              <h2
                className={`${
                  activeSection === 0 ? "text-sm" : " text-lg "
                } font-semibold`}
              >
                Skilling, Enabling, and Support (SES) for Employment
              </h2>
              <p
                className={`text-black text-left text-sm ${
                  activeSection === 3
                    ? "md:block sm:block"
                    : " md:hidden sm:hidden"
                } lg:block`}
              >
                The program provides hands-on training and support in small
                livestock farming, crop value chain development, and veterinary
                input supply. Additionally, participants are linked to
                apprenticeship opportunities, internships, and job placements.
                We also focus on enhancing logistics, processing, and upscaling
                MSMEs to promote sustainable trade and employment.
              </p>
            </div>
            <div
              className="flex-1 px-4 py-4 border-2 border-transparent rounded-lg text-center mb-4 relative flex flex-col justify-center items-center"
              onClick={() => handleSectionClick(2)}
            >
              <div
                className="absolute inset-0 rounded-lg border-2 border-transparent bg-clip-padding border-opacity-50"
                style={{
                  borderImage:
                    "linear-gradient(180deg, #0E743F 0%, #C7DA1A 100%)",
                  borderImageSlice: 1,
                }}
              />

              <img src={profiling} alt="Logo" className="mb-2" />
              <h2 className="text-lg font-semibold">
                Profiling and Segmentation
              </h2>
              <p
                className={`text-black text-left text-sm ${
                  activeSection === 2
                    ? "md:block sm:block"
                    : " md:hidden sm:hidden"
                } lg:block`}
              >
                Based on set criteria, participants are profiled and segmented
                to match them with the appropriate pathways for professional
                intervention. Youth collectives are formed and strengthened
                within different value chains to ensure targeted support and
                development.
              </p>
            </div>
            <div
              className="flex-1 px-4 py-4 border-2 border-transparent rounded-lg text-center mb-4 relative flex flex-col justify-center items-center"
              onClick={() => handleSectionClick(1)}
            >
              <div
                className="absolute inset-0 rounded-lg border-2 border-transparent bg-clip-padding border-opacity-50"
                style={{
                  borderImage:
                    "linear-gradient(180deg, #0E743F 0%, #C7DA1A 100%)",
                  borderImageSlice: 1,
                }}
              />

              <img src={inspiration} alt="Logo" className="mb-2" />
              <h2 className="text-lg font-semibold">
                Inspiration and Empowerment Training
              </h2>
              <p
                className={`text-black text-left text-sm ${
                  activeSection === 1
                    ? "md:block sm:block"
                    : " md:hidden sm:hidden"
                } lg:block`}
              >
                Once enrolled, participants undergo personal development, life
                skills, and soft skills training. This includes basic
                entrepreneurship, leadership, and business planning sessions,
                designed to inspire and empower individuals to take control of
                their future.
              </p>
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
