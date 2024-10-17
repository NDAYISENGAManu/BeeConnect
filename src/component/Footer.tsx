import { useEffect, useState } from "react";
import { Modal } from "antd";
import techouse from "../assets/footer_poweredby.svg";
import logo from "../assets/logo.svg";

const Footer = () => {
  const [hasValidToken, setHasValidToken] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasValidToken(!!token);
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row justify-between items-center px-12 py-6 h-20 w-full fixed bottom-0 font-roboto select-none ${
          hasValidToken ? "bg-[#EAEAEA]" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-center sm:justify-start">
          <p className="text-sm font-medium ml-2 mt-2 sm:mt-0 text-[#858585]">
            Copyright © 2024 BeeConnect - All rights reserved.
          </p>
        </div>

        <div className="flex items-center justify-center text-black mx-auto text-sm sm:ml-auto">
          <p>
            <span className="divider">F.A.Q</span>
            <span className="divider">Terms & Conditions</span>
            <span className="divider cursor-pointer" onClick={showModal}>
              Privacy Policy
            </span>
          </p>
        </div>

        <div className="flex items-center justify-center sm:justify-end space-x-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <img
                src={techouse}
                alt="Company Logo"
                className="w-2 md:w-24 pointer-events-none select-none"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={
          <span style={{ color: "#0C743F", fontSize: "12px" }}>
            Privacy Policy
          </span>
        }
        onCancel={handleOk}
        open={isModalVisible}
        footer={null}
        width={800}
      >
        <div className="flex flex-col items-center mb-4">
          <img
            src={logo}
            alt="Company Logo"
            className="w-100 h-100 sm:w-16 sm:h-16 lg:w-32 lg:h-20 pointer-events-none select-none mb-4"
            draggable="false"
          />
          <h2 className="text-[#0C743F] text-center text-xl mb-2">
            <strong>
              The BeeConnect youth mobilization and registration platform
              consent form
            </strong>
          </h2>
        </div>

        <div className="flex flex-col">
          <p>
            This consent form aims to ensure that youth participants who
            register on this platform are aware that their personal data will be
            used for BeeConnect project purposes solely and will be handled with
            utmost privacy. This applies to all Youth Participants and program
            partners (BeeConnect grantees and Super aggregator partners).
          </p>
          <p className="text-[#0C743F] mb-2">
            <strong>
              CONSENT TO USE PERSONAL DATA AND INFORMATION BeeConnect
            </strong>
          </p>
          <p>
            seeks your consent to record your personal information to this
            digital platform. This information will be used for project purposes
            such as understanding the number of youths mobilized for the
            program, number of youth receiving services offered by the program,
            and youth who secured employment through the BeeConnect program.
          </p>
          <p>
            The information will inform BeeConnect’s reports and publications
            which may be shared with its partners, donors, and government
            institutions.
          </p>
          <p>
            I permit BeeConnect and its Partners to use my personal information
            exclusively for program purposes and non-commercial purposes.
          </p>
          <p className="text-[#0C743F] mb-2">
            <strong>DECLARATION</strong>
          </p>
          <p>
            I give full consent to participate in the mobilization and
            registration of youth participants on the digital platform. I
            understand that it is my full responsibility to abide by all safety
            measures set out by the developers of the platform (BKTECHOUSE).
          </p>
          <p>
            I confirm that prior to registration I have read and understood the
            consent terms.
          </p>
        </div>
        <div className="flex">
          <button
            type="submit"
            onClick={handleOk}
            className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
          >
            Ok
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Footer;
