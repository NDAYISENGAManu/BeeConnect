import React from "react";
import notFound from "../assets/notfound.svg";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ebf4f0] select-none">
      <div className="w-full max-w-md p-4 text-center bg-[#ebf4f0]">
        <img
          src={notFound}
          alt="Company Logo"
          className="mb-10 pointer-events-none select-none"
          draggable="false"
        />

        <h1 className="text-3xl font-bold text-gray-800">
          404 - Page Not Found
        </h1>
        <p className="text-black text-sm font-normal">
          The page you are looking for might not been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>
    </div>
  );
};

export default NotFound;

