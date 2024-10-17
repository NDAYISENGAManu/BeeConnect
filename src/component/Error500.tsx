import React from "react";
import serverError from "../assets/servererror.svg";

const Error500: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ebf4f0]">
      <div className="w-full max-w-md p-4 text-center bg-[#ebf4f0]">
        <img src={serverError} alt="Company Logo" className="mb-10" />
        <h1 className="text-3xl font-bold text-gray-800 my-2">
          500 - Server Error
        </h1>
        <p className="text-black text-sm font-normal">
          Oops! Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
};

export default Error500;
