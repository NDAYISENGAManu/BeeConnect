import { useState, useEffect } from "react";
import image1 from "../assets/about1.jpg";
import image2 from "../assets/about2.jpg";
import image3 from "../assets/about3.jpg";
import avocado from "../assets/avocado.svg";
import crop from "../assets/crop.svg";
import chilli from "../assets/chilli.svg";
import pourty from "../assets/pourty.svg";

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState("fade-in");

  const slides = [
    {
      title: "5 years",
      description: "Partnership program between",
      logos: ["/"],
      program: "Beeconnect",
      details:
        "This program aims to catalyze dignified and fulfilling work for young people, especially young women, and disadvantaged groups.",
      image: image1,
      layout: "standard",
    },
    {
      title:
        "Beeconnect recognizes that the success of young entrepreneurs in agriculture hinges on a well-coordinated ecosystem that provides the support they need",
      layout: "opportunity",
      image: image2,
    },
    {
      title: "This target will be achieved through",
      layout: "target",
      image: image3,
    },
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setFade("fade-out");
      setTimeout(() => {
        setCurrentSlide((prevSlide) =>
          prevSlide === slides.length - 1 ? 0 : prevSlide + 1
        );
        setFade("fade-in");
      }, 500);
    }, 6000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const renderSlideContent = (
    slide:
      | {
          title: string;
          description: string;
          logos: string[];
          program: string;
          details: string;
          image: string;
          layout: string;
        }
      | {
          title: string;
          layout: string;
          image: string;
          description?: undefined;
          logos?: undefined;
          program?: undefined;
          details?: undefined;
        }
  ) => {
    switch (slide.layout) {
      case "detailed":
        return (
          <div className="text-[#0E743F]">
            <h1 className="text-5xl font-bold mb-4 text-[#0A540E]">
              {slide.title}
            </h1>
            <span className="text-sm font-normal">{slide.description}</span>
            <div className="flex items-center mb-4">
              <img src="" alt="Logo" className="mr-2 h-full w-full" />
            </div>
            <p className="text-lg font-bold">{slide.program}</p>
            <span className="mt-4 text-sm font-normal">{slide.details}</span>
          </div>
        );
      case "opportunity":
        return (
          <div className="text-[#0E743F]">
            <h1 className="text-sm font-bold mb-4">{slide.title}</h1>
            <hr className="border-[#0E743F] border-1 w-full my-4" />
            <span className="text-xl font-normal">This program will reach</span>
            <h1 className="text-3xl text-[#0A540E] font-bold my-0 py-0">
              800,000
            </h1>
            <span className="text-xl text-[#0A540E] font-normal">youth,</span>
            <hr className="border-[#0E743F] border-1 w-full my-4" />
            <span className="text-xl font-normal">
              which will lead to creation of
            </span>
            <h1 className="text-3xl font-bold my-0 py-0 text-[#0A540E]">
              132,000
            </h1>
            <span className="text-xl font-normal text-[#0A540E]">
              work opportunities,
            </span>
          </div>
        );
      case "target":
        return (
          <div className="text-[#0E743F]">
            <h1 className="text-xl font-bold">{slide.title}</h1>
            <p className="text-sm font-normal mb-4">
              supporting selected value chains
            </p>
            <ul className="flex flex-wrap text-sm gap-2">
              <li className="flex items-center mb-2">
                <img src={avocado} alt="Avocado" className="w-6 h-6 mr-2" />
                Avocado
              </li>
              <li className="flex items-center mb-2">
                <img src={chilli} alt="Chillies" className="w-6 h-6 mr-2" />
                Chillies
              </li>
              <li className="flex items-center mb-2">
                <img src={pourty} alt="Pourty" className="w-6 h-6 mr-2" />
                Pourty
              </li>
              <li className="flex items-center mb-2">
                <img
                  src={crop}
                  alt="Selected staple crops"
                  className="w-6 h-6 mr-2"
                />
                Selected staple crops
              </li>
            </ul>
            <span className="text-sm font-normal text-[#0A540E]">
              Accelerating financial access, expanding access to business
              development services, strengthening market systems, improving
              coordination within the entrepreneurship ecosystem, and increasing
              youth inclusivity and voice.
            </span>
          </div>
        );
      default:
        return (
          <div className="text-[#0E743F]">
            <h1 className="text-5xl font-bold mb-4 text-[#0A540E]">
              {slide.title}
            </h1>
            <span className="text-sm font-normal">{slide.description}</span>
            <div className="flex items-center mb-4">
              <img src="" alt="Logo" className="mr-2" />
            </div>
            <p className="text-lg font-bold">{slide.program}</p>
            <span className="mt-4 text-sm font-normal">{slide.details}</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full px-4 md:px-10 sm:pb-10 h-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-left font-bold my-7 text-[#0E743F]">
          ABOUT THE PROJECT
        </h1>
      </div>

      {/* Slide Content */}
      <div
        className={`w-full flex flex-col lg:flex-row justify-between lg:gap-5 transform transition-transform duration-1000 ease-in-out ${fade}`}
        style={{ willChange: "transform" }}
      >
        {/* Image Section */}
        <div className="relative w-full lg:w-[70%] rounded-[30px]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0C743F] z-10 rounded-[30px]" />
          <img
            src={slides[currentSlide].image}
            alt="About the project"
            className="rounded-[30px] w-full md:h-[100%] object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`bg-white rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
                  currentSlide === index ? "h-3 w-3" : "h-2 w-2"
                }`}
                onClick={() => setCurrentSlide(index)}
                style={{ transition: "background-color 0.3s ease" }}
              />
            ))}
          </div>
        </div>

        {/* Content Section */}
        {/* <div className="w-full lg:w-[29%] p-5 md:p-10 text-left bg-none lg:bg-[#EBF5E5] rounded-[30px] flex flex-col justify-center">
          <div className="flex-grow">
            {renderSlideContent(slides[currentSlide])}
          </div>
        </div> */}
        <div className="w-full lg:w-[30%] p-5 text-left bg-none lg:bg-[#EBF5E5] rounded-[30px] flex flex-col justify-center overflow-hidden">
          <div className="flex-grow max-h-[400px] overflow-y-auto">
            {renderSlideContent(slides[currentSlide])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
