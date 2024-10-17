import React from "react";
import modernized from "../assets/modernized.svg";
import expanded from "../assets/expanded.svg";
import strengthened from "../assets/strengthened.svg";
import engineered from "../assets/engineered.svg";
import impacts from "../assets/impact.jpg";
import included from "../assets/included.svg";

const Impacts: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row rounded-r-3xl h-auto lg:h-[550px]">
      <div className="flex-1 px-10 md:px-4 sm:px-10 lg:px-20 py-6 lg:py-10 text-start">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[#0E743F] text-start">
          IMPACT
        </h2>
        <p className="mb-6 text-[#0E743F] text-sm sm:text-base text-start">
          This comprehensive program transitions youth towards achieving the
          following outcomes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start">
            <img
              src={modernized}
              alt="Modernized Agriculture"
              className="mb-2 mr-3 w-6 h-6"
            />
            <div>
              <h3 className="font-semibold text-[#0E743F] text-sm sm:text-base">
                Modernized Agriculture
              </h3>
              <p className="text-xs sm:text-sm font-normal">
                By empowering youth with skills and resources, we drive the
                modernization of agricultural practices, making farming more
                efficient and profitable.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <img
              src={expanded}
              alt="Expanded Markets"
              className="mb-2 mr-3 w-6 h-6"
            />
            <div>
              <h3 className="font-semibold text-[#0E743F] text-sm sm:text-base">
                Expanded and Diversified Markets
              </h3>
              <p className="text-xs sm:text-sm font-normal">
                Enabling youth to access larger, more diverse markets for their
                products and services.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <img
              src={strengthened}
              alt="Youth Voice"
              className="mb-2 mr-3 w-6 h-6"
            />
            <div>
              <h3 className="font-semibold text-[#0E743F] text-sm sm:text-base">
                Strengthened Entrepreneurs Ecosystem
              </h3>
              <p className="text-xs sm:text-sm font-normal">
                Fostering a network of support, training, and collaboration to
                build resilient youth-led enterprises.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <img
              src={engineered}
              alt="Financial Inclusion"
              className="mb-2 mr-3 w-6 h-6"
            />
            <div>
              <h3 className="font-semibold text-[#0E743F] text-sm sm:text-base">
                Engineered Financial Inclusion
              </h3>
              <p className="text-xs sm:text-sm font-normal">
                Ensuring access to financial services to support entrepreneurial
                growth and sustainability.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <img
              src={included}
              alt="Youth Voice"
              className="mb-2 mr-3 w-6 h-6"
            />
            <div>
              <h3 className="font-semibold text-[#0E743F] text-sm sm:text-base">
                Included Youth Voice
              </h3>
              <p className="text-xs sm:text-sm font-normal">
                Ensuring that youth, including those from vulnerable, rural, and
                urban settings, have a platform to participate in economic
                development.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="flex-2 hidden lg:flex justify-center items-center">
        <img
          src={impacts}
          alt="Youth Engaging in Agriculture"
          className="w-full h-auto lg:h-[100%] object-cover rounded-r-3xl"
        />
      </div>
    </div>
  );
};

export default Impacts;
