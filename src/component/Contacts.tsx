import {
  EnvironmentOutlined,
  FacebookOutlined,
  InstBeeConnectmOutlined,
  LinkedinOutlined,
  MailOutlined,
  SendOutlined,
  TwitterCircleFilled,
} from "@ant-design/icons";
import React from "react";
import contacts from "../assets/contact.jpg";

const Contacts: React.FC = () => {
  return (
    <div className="relative w-full h-[550px] p-5 md:px-20 m-0">
      {/* Slide Container with fade effect */}
      <div>
        <h1 className="text-2xl text-left font-bold my-7 text-[#0E743F]">
          CONTACT US
        </h1>
      </div>
      <div className="overflow-auto">
        <img src={contacts} alt="Logo" className="mb-2 w-full rounded-[30px]" />

        <div className="flex flex-wrap justify-between mt-4">
          <div className="flex-1 mx-2 p-4 text-center">
            <div className="flex items-start gap-0">
              <EnvironmentOutlined className="text-6xl mx-3" />
              <div className="font-normal text-start">
                <h2 className="text-green-900 text-sm font-semibold">
                  Address
                </h2>
                <p className="text-sm font-normal">
                  C/O CIAT - RWANDA, KG 563 ST, Solace Way, P.O. Box 1269,
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 mx-2 p-4 text-center">
            <div className="flex items-start gap-0">
              <MailOutlined className="text-6xl mx-3" />
              <div className="font-normal text-start">
                <h2 className="text-green-900 text-sm font-semibold">Email</h2>
                <p className="text-sm font-normal">info@BeeConnect.org</p>
              </div>
            </div>
          </div>
          <div className="flex-1 mx-2 p-4 text-center">
            <div className="flex items-start gap-0">
              <SendOutlined
                className="text-6xl mx-3"
                style={{ transform: "rotate(330deg)" }}
              />
              <div className="font-normal text-start">
                <h2 className="text-sm font-semibold text-green-900">
                  Social Media
                </h2>
                <div className="flex justify-center mt-2">
                  <a
                    href="https://www.facebook.com/BeeConnectAlliance?_rdc=1&_rdr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookOutlined className="text-xl mx-1 text-green-900 cursor-pointer" />
                  </a>
                  <a
                    href="https://x.com/BeeConnect_Africa"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterCircleFilled className="text-xl mx-1 text-green-900 cursor-pointer" />
                  </a>
                  <a
                    href="https://www.instBeeConnectm.com/BeeConnect_africa/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstBeeConnectmOutlined className="text-xl mx-1 text-green-900 cursor-pointer" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/BeeConnectalliance/?originalSubdomain=ke"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedinOutlined className="text-xl mx-1 text-green-900 cursor-pointer" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
