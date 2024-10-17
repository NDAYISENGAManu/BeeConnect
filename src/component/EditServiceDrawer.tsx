/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Drawer, Form, Button, Input, Select, Modal, Radio } from "antd";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { ServiceType } from "../types/globalData";
import TextArea from "antd/es/input/TextArea";

interface EditServiceDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedRecord: ServiceType | null;
  onServiceUpdated: () => void;
}

const EditServiceDrawer: React.FC<EditServiceDrawerProps> = ({
  visible,
  onClose,
  selectedRecord,
  onServiceUpdated,
}) => {
  const [form] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [serviceCategories, setServiceCategories] = useState<
    { _id: string; name: string }[]
  >([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/service-category`, {
          headers: { "x-auth-token": token },
        });
        setServiceCategories(
          response.data.data.map((category: { _id: string; name: string }) => ({
            _id: category._id,
            name: category.name,
          }))
        );
      } catch (error) {
        // message.error("Failed to fetch service categories");
      }
    };
    fetchServiceCategories();
  }, [baseUrl, token]);

  useEffect(() => {
    if (selectedRecord) {
      form.setFieldsValue({
        name: selectedRecord?.name || "",
        description: selectedRecord?.description,
        category:
          serviceCategories.find(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (category) => category.name === selectedRecord?.category
          )?._id || selectedRecord?.category,
        requiresLandInfo:
          selectedRecord.requiresLandInfo === "YES"
            ? "YES"
            : selectedRecord.requiresLandInfo === "NO"
            ? "NO"
            : "NO",
      });
    }
  }, [selectedRecord, form, serviceCategories]);



  const serviceId = selectedRecord?.key;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!serviceId) {
      console.error("Selected record ID is missing.");
      return;
    }

    const updatedFields: Partial<ServiceType> = {
      name: values.name,
      description: values.description,
      category: values.category,
      requiresLandInfo: values.requiresLandInfo,
    };

    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/service/id/${serviceId}`,
        updatedFields,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setStatusCode(response.status);
        setStatusMessage("Service details updated successfully.");
        setStatusModalVisible(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error updating Service details:",
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
    onServiceUpdated();
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
            Edit Applicant
          </span>
        }
        // width={800}
        onClose={onClose}
        open={visible}
        styles={styles}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-1">
            <div className="formlabels">
              <Form.Item
                name="name"
                label={<span style={styles.label}>Name</span>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span style={styles.label}>Description</span>}
                rules={[{ required: true }]}
              >
                <TextArea />
              </Form.Item>
              <Form.Item
                name="category"
                label={<span style={styles.label}>Category</span>}
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select category"
                  className="border-gray-500 w-full rounded-none border focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                  options={serviceCategories.map((category) => ({
                    value: category._id,
                    label: category.name,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="requiresLandInfo"
                label={<span style={styles.label}>Requires Land Info</span>}
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="YES">Yes</Radio>
                  <Radio value="NO">No</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
            <Form.Item>
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
              >
                Update Service
              </button>
            </Form.Item>
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

export default EditServiceDrawer;
