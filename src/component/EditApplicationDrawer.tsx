/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Drawer, Form, Button, Input, Modal, Select } from "antd";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { Application } from "../types/globalData";

interface EditApplicationDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedRecord: Application | null;
  onApplicationUpdated: () => void;
}

const EditApplicationDrawer: React.FC<EditApplicationDrawerProps> = ({
  visible,
  onClose,
  selectedRecord,
  onApplicationUpdated,
}) => {
  const [form] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (selectedRecord) {
      form.setFieldsValue({
        ...selectedRecord,
        service: selectedRecord?.serviceName || "",
        organizationName: selectedRecord?.organizationName || "",
        userName: selectedRecord?.userName || "",
        educationLevel: selectedRecord?.educationLevel || "",
        approvalStatus: selectedRecord?.approvalStatus || "",
        knowledgeLevel: selectedRecord?.knowledgeLevel || "",
        businessType: selectedRecord?.businessType || "",
        smeCategory: selectedRecord?.smeCategory || "",
        location: selectedRecord?.location || "",
        totalLandSizeOwned: selectedRecord?.totalLandSizeOwned || "",
        totalLandSizeAccessed: selectedRecord?.totalLandSizeAccessed || "",
        landOwnership: selectedRecord?.landOwnership || "",
        landSize: selectedRecord?.landSize || "",
      });
    }
  }, [selectedRecord, form]);

  const applicationId = selectedRecord?.key;

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (!applicationId) {
      console.error("Selected record ID is missing.");
      return;
    }

    const updatedFields: Partial<Application> = {
      totalLandSizeOwned: values?.totalLandSizeOwned,
      totalLandSizeAccessed: values?.totalLandSizeAccessed,
      landOwnership: values?.landOwnership,
    };

    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/application/id/${applicationId}/edit`,
        updatedFields,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setStatusCode(response.status);
        setStatusMessage("Application details updated successfully.");
        setStatusModalVisible(true);
        onApplicationUpdated();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error updating application details:",
          error.response?.data || error.message
        );
        setStatusCode(error.response?.status || 500);
        setStatusMessage(error.response?.data?.message || "An error occurred.");
      } else {
        console.error("Unexpected error:", error);
        setStatusCode(500);
        setStatusMessage("An unexpected error occurred.");
      }
      setStatusModalVisible(true);
    }
  };

  const handleModalOk = () => {
    setStatusModalVisible(false);
    onClose();
  };

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    label: {
      color: "#0C743F",
      fontWeight: "bold",
    },
  };

  return (
    <>
      <Drawer
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Edit Application
          </span>
        }
        onClose={onClose}
        open={visible}
        styles={styles}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={() => {
            const totalLandSizeOwned = form.getFieldValue("totalLandSizeOwned");
            const totalLandSizeAccessed = form.getFieldValue(
              "totalLandSizeAccessed"
            );
            const landSize = form.getFieldValue("landSize");

            if (totalLandSizeOwned && totalLandSizeAccessed && landSize) {
              const sum =
                Number(totalLandSizeOwned) + Number(totalLandSizeAccessed);
              if (sum > Number(landSize)) {
                form.setFields([
                  {
                    name: "totalLandSizeAccessed",
                    errors: [
                      "Total Land Size owned and accessed exceeds the total land size.",
                    ],
                  },
                ]);
              } else {
                form.setFields([{ name: "totalLandSizeAccessed", errors: [] }]);
              }
            }
          }}
        >
          <div className="grid gap-6 mb-6 md:grid-cols-1">
            <div className="formlabels">
              <Form.Item
                name="landSize"
                className=" rounded-none"
                label={<span style={styles.label}>Land Size</span>}
              >
                <Input className=" rounded-none" disabled />
              </Form.Item>
              <Form.Item
                name="totalLandSizeOwned"
                label={<span style={styles.label}>Total Land Size owned</span>}
              >
                <Input className=" rounded-none" />
              </Form.Item>

              <Form.Item
                name="totalLandSizeAccessed"
                label={
                  <span style={styles.label}>Total Land Size Accessed</span>
                }
              >
                <Input className=" rounded-none" />
              </Form.Item>
              <Form.Item
                name="landOwnership"
                label={<span style={styles.label}>Land Ownership</span>}
              >
                <Select className=" rounded-none">
                  <Select.Option value={1}>Nubwange</Select.Option>
                  <Select.Option value={2}>Ndabukodesha</Select.Option>
                  <Select.Option value={3}>Buravanze</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
                >
                  Update Application
                </button>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Drawer>
      <Modal
        visible={statusModalVisible}
        onCancel={handleModalOk}
        footer={null}
        closable={false}
        styles={styles}
      >
        {statusCode === 200 || statusCode === 201 ? (
          <>
            <div className="center-container font-bold">
              <img src={success} alt="" className="mt-10" />
              <span className="text-3xl my-5 text-[#0C743F]">Thank you!</span>
              <span className="text-lg text-[#0C743F]">{statusMessage}</span>
            </div>
            <div className="flex items-center justify-center my-5">
              <Button
                key="Ok"
                onClick={handleModalOk}
                className="lg:w-[32%] sm:w-full p-5 text-[#757575] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="center-container font-bold">
              <img src={icoerror} alt="" className="mt-10" />
              <span className="text-3xl my-5 text-[#FF0000]">Oooops!</span>
              <span className="text-lg text-[#FF0000]">{statusMessage}</span>
            </div>
            <div className="flex items-center justify-center my-5">
              <Button
                key="Ok"
                onClick={handleModalOk}
                className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default EditApplicationDrawer;
