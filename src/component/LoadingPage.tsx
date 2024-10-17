import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const LoadingPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ebf4f0]">
      <Spin
        indicator={
          <LoadingOutlined
            style={{ fontSize: 68 }}
            spin
            className="text-[#0C743F]"
          />
        }
      />
      <p className="mt-4 text-lg">Logging out ...</p>
    </div>
  );
};

export default LoadingPage;
