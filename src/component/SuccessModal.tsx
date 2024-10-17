import React from "react";
import { Modal, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import success from "../assets/success.svg";

interface SuccessModalProps {
  isSuccessModalVisible: boolean;
  handleSuccessModalOk: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isSuccessModalVisible,
  handleSuccessModalOk,
}) => {
  return (
    <Modal
      visible={isSuccessModalVisible}
      onOk={handleSuccessModalOk}
      footer={null}
      closeIcon={<CloseOutlined />}
    >
      <div className="center-container font-bold">
        <img src={success} alt="" className="mt-10" />
        <span className="text-3xl my-5 text-[#0C743F]">Thank you!</span>
        <span className="text-lg text-[#0C743F]">
          Upload is in progress, you will get an email once it's done.
        </span>
      </div>
      <div className="flex items-center justify-center">
        <Button onClick={handleSuccessModalOk} className="my-5">
          OK
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
