/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Modal, Button, Spin } from "antd";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { LoadingOutlined } from "@ant-design/icons";

interface EditEnterpriseDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedRecord: EnterpriseEditTypes | null;
  onEnterpriseUpdate: () => void;
}

export interface EnterpriseEditTypes {
  key: any;
  _id: any;
  name: string;
  tinNumber: string;
  type: number;
  totalYouthEmployed: number;
  noOfYouthRefugees: number;
  noOfYouthIDPs: number;
  noOfYouthPLWDs: number;
  smeCategory: number;
  owner: {
    nationalId: number;
  };
  subPartners?: string;
}

const EditEnterpriseDrawer: React.FC<EditEnterpriseDrawerProps> = ({
  visible,
  onClose,
  selectedRecord,
  onEnterpriseUpdate,
}) => {
  const [form] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loadingButtons, setLoadingButtons] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (selectedRecord) {
      form.setFieldsValue(selectedRecord);
    }
  }, [selectedRecord]);

  const handleSubmit = async (values: any) => {
    setLoadingButtons(true);
    const recordId = selectedRecord?._id || selectedRecord?.key;

    if (!recordId) {
      console.error("No selectedRecord ID available");
      return;
    }

    try {
      await form.validateFields();
      const { owner, ...otherValues } = values;
      const updatedFields = {
        ...otherValues,
        owner: { nationalId: owner.nationalId },
      };

      const response = await axios.put(
        `${baseUrl}/api/v1/enterprise/id/${recordId}`,
        updatedFields,
        {
          headers: { "x-auth-token": token },
        }
      );
      if (response.status === 200 || response.status === 201) {
        setStatusCode(response.status);
        setStatusMessage("Enterprise details updated successfully.");
        onEnterpriseUpdate();
        setStatusModalVisible(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.error(
        //   "Error updating enterprise details:",
        //   error.response?.data || error.message
        // );
        setStatusCode(error.response?.status || 500);
        setStatusMessage(error.response?.data?.message || "An error occurred.");
      } else {
        // console.error("Unexpected error:", error);
        setStatusCode(500);
        setStatusMessage("An unexpected error occurred.");
      }
      setStatusModalVisible(true);
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleModalOk = () => {
    setStatusModalVisible(false);
    onClose();
  };

  const fetchCitizenData = (nationalId: string) => {
    axios
      .post(
        `
        ${baseUrl}/api/v1/user/citizen`,
        { nationalId },
        {
          headers: { "x-auth-token": token },
        }
      )
      .then((response) => {
        if (response.data.data.nidExists) {
          const { foreName, surname } = response.data.data;
          form.setFieldsValue({
            owner: {
              firstName: foreName,
              lastName: surname,
            },
          });
        } else {
          form.setFieldsValue({
            owner: {
              firstName: "",
              lastName: "",
            },
          });
          form.setFields([
            {
              name: ["owner", "nationalId"],
              errors: [
                "Owner National ID is not registered. Please register through *775#.",
              ],
            },
          ]);
        }
      })
      .catch(() => {
        form.setFields([
          {
            name: ["owner", "nationalId"],
            errors: ["National ID not found"],
          },
        ]);
      });
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
            Edit Enterprise
          </span>
        }
        width={800}
        onClose={onClose}
        open={visible}
        styles={styles}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid gap-6 m-0 p-0 md:grid-cols-2">
            <div className="formlabels rounded-md">
              <h2 className="font-bold text-lg">Enterprise Info</h2>
              <Form.Item
                name="name"
                label={<span style={styles.label}>Name</span>}
                rules={[{ required: true }]}
              >
                <Input className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500" />
              </Form.Item>
              <Form.Item
                name="type"
                label={<span style={styles.label}>Type</span>}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: "Informal", value: 2 },
                    { label: "Formal", value: 1 },
                  ]}
                  placeholder="Select type"
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="totalYouthEmployed"
                label={<span style={styles.label}>Total Youth Employed</span>}
                rules={[
                  {
                    required: true,
                    message: "Please enter number of Total Youth Employed.",
                  },
                ]}
              >
                <Input
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="noOfYouthRefugees"
                label={<span style={styles.label}>Youth Refugees</span>}
                rules={[
                  {
                    required: true,
                    message: "Please enter number of Youth Refugees.",
                  },
                ]}
              >
                <Input
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="noOfYouthIDPs"
                label={<span style={styles.label}>Youth IDP's</span>}
                rules={[
                  { required: true, message: "Please enter Youth IDP's." },
                ]}
              >
                <Input
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="noOfYouthPLWDs"
                label={<span style={styles.label}>Youth PLWD's</span>}
                rules={[
                  { required: true, message: "Youth PLWD's is required" },
                ]}
              >
                <Input
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="smeCategory"
                label={<span style={styles.label}>SME Category</span>}
                rules={[
                  { required: true, message: "Phone number is required" },
                ]}
              >
                <Select
                  options={[
                    { label: "Gazelles", value: 3 },
                    { label: "Bootstrapers", value: 2 },
                    { label: "Inviscible", value: 1 },
                  ]}
                  placeholder="Select SME category"
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="tinNumber"
                label={<span style={styles.label}>Tin Number</span>}
                rules={[{ required: true, message: "Tin number is required" }]}
              >
                <Input
                  maxLength={9}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="subPartners"
                label={<span style={styles.label}>Sub Partners</span>}
              >
                <Input className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500" />
              </Form.Item>
            </div>
            <div className="formlabels rounded-md">
              <h2 className="font-bold text-lg">Owner Info</h2>
              <Form.Item
                name={["owner", "nationalId"]}
                label={<span style={styles.label}>National ID</span>}
                rules={[{ required: true, len: 16 }]}
              >
                <Input
                  maxLength={16}
                  placeholder="Enter NID"
                  className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500 w-full"
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  onBlur={(e) => {
                    const nationalId = e.target.value;
                    if (nationalId.length === 16) {
                      fetchCitizenData(nationalId);
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name={["owner", "firstName"]}
                label={<span style={styles.label}>First Name</span>}
              >
                <Input
                  disabled
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name={["owner", "lastName"]}
                label={<span style={styles.label}>Last Name</span>}
              >
                <Input
                  disabled
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name={["owner", "phoneNumber"]}
                label={<span style={styles.label}>Phone Number</span>}
              >
                <Input
                  disabled
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  disabled={loadingButtons}
                  className="bg-[#0C743F] cursor-pointer text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
                >
                  {loadingButtons ? (
                    <>
                      <span>Save Changes</span>
                      <Spin
                        className="ml-5"
                        indicator={
                          <LoadingOutlined
                            spin
                            className="text-[#0C743F] font-extrabold"
                          />
                        }
                      />
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
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

export default EditEnterpriseDrawer;
