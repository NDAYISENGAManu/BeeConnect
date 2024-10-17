/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Drawer, Form, Button, Input, Select, Modal, message } from "antd";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { Partner } from "../types/globalData";
import { formatPhone } from "../helper/validation.heper";

interface EditPartnerDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedRecord: Partner | null;
  onPartnerUpdate: () => void;
}

const EditPartnerDrawer: React.FC<EditPartnerDrawerProps> = ({
  visible,
  onClose,
  selectedRecord,
  onPartnerUpdate,
}) => {
  const [form] = Form.useForm();
  const [districts, setDistricts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDistricts();
    fetchServices();
  }, []);

  useEffect(() => {
    const isFormValid = form
      .getFieldsError()
      .every(({ errors }) => errors.length === 0);
    setIsSubmitDisabled(!isFormValid);
  }, [form]);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/geomap/upper`, {
        headers: { "x-auth-token": token },
      });
      const regions = response.data.data;
      const districts = regions.flatMap((region: any) => region.districts);
      const districtOptions = districts.map((district: any) => ({
        label: district.name,
        value: district._id,
      }));
      setDistricts(districtOptions);
    } catch (error) {
      // console.error("Error fetching locations:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/service`, {
        headers: { "x-auth-token": token },
      });
      const servicesData = response.data.data.map((service: any) => ({
        _id: service._id,
        name: service.name,
      }));
      setServices(servicesData);
    } catch (error) {
      // console.log(error(`Failed to fetch services`));
    }
  };

  useEffect(() => {
    if (selectedRecord) {
      const {
        owner,
        coveredDistricts,
        servicesProvided,
        type,
        ...otherFields
      } = selectedRecord;

      form.setFieldsValue({
        ...otherFields,
        type: type === 2 ? 2 : 1,
        owner: {
          firstName: owner?.firstName,
          lastName: owner?.lastName,
          phoneNumber: owner?.phoneNumber,
          email: owner?.email,
          nationalId: owner?.nationalId,
        },
        coveredDistricts: coveredDistricts?.map(
          (district: any) => district._id
        ),
        servicesProvided: servicesProvided?.map((service: any) => {
          const foundService = services.find((s) => s._id === service._id);
          return foundService ? foundService._id : service._id;
        }),
      });
    }
  }, [selectedRecord, form, services]);

  useEffect(() => {
    if (selectedRecord && districts.length && services.length) {
      const {
        owner,
        coveredDistricts,
        servicesProvided,
        type,
        ...otherFields
      } = selectedRecord;

      form.setFieldsValue({
        ...otherFields,
        type: type === 2 ? 2 : 1,
        owner: {
          firstName: owner?.firstName,
          lastName: owner?.lastName,
          phoneNumber: owner?.phoneNumber,
          email: owner?.email,
          nationalId: owner?.nationalId,
        },
        coveredDistricts: coveredDistricts?.map(
          (district: any) => district._id
        ),
        servicesProvided: servicesProvided?.map((service: any) => {
          const foundService = services.find((s) => s._id === service._id);
          return foundService ? foundService._id : service._id;
        }),
      });
    }
  }, [selectedRecord, districts, services, form]);

  const organisationId = selectedRecord?._id;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!organisationId) {
      return;
    }

    try {
      const updatedFields: Partial<Partner> = {
        ...values,
        type: values.type,
        coveredDistricts: values.coveredDistricts?.map((districtId: string) => {
          const district = districts.find((d) => d.value === districtId);
          return {
            _id: districtId,
            name: district ? district.label : "",
          };
        }),
        servicesProvided:
          values.servicesProvided
            ?.map((serviceId: string) => {
              const service = services.find((s) => s._id === serviceId);
              return service && service.name
                ? {
                    _id: serviceId,
                    name: service.name,
                  }
                : null;
            })
            .filter(Boolean) || [],
        owner: {
          ...values.owner,
        },
      };

      const response = await axios.put(
        `${baseUrl}/api/v1/organization/id/${organisationId}`,
        updatedFields,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setStatusCode(response.status);
        setStatusMessage("Partner details updated successfully.");
        setStatusModalVisible(true);
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";

      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data;

        if (
          apiError &&
          apiError.error &&
          typeof apiError.error.message === "string"
        ) {
          errorMessage = apiError.error.message;
        } else if (typeof apiError.message === "string") {
          errorMessage = apiError.message;
        }

        setStatusCode(error.response?.status || 500);
      } else {
        setStatusCode(500);
        errorMessage = "An unexpected error occurred.";
      }

      setStatusMessage(errorMessage);
      setStatusModalVisible(true);
    }
  };

  const handleModalOk = () => {
    setStatusModalVisible(false);
    onClose();
    onPartnerUpdate();
  };

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
    label: {
      color: "#0C743F",
      fontWeight: "bold",
    },
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const formattedPhone = formatPhone(phoneNumber);
    return formattedPhone ? formattedPhone : null;
  };

  const fetchCitizenData = (nationalId: string) => {
    axios
      .post(
        `${baseUrl}/api/v1/user/citizen`,
        { nationalId },
        {
          headers: { "x-auth-token": token },
        }
      )
      .then((response) => {
        if (response.data.data) {
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
          message.error("No data found for this National ID.");
        }
      })
      .catch((error) => {
        form.setFieldsValue({
          owner: {
            firstName: "",
            lastName: "",
          },
        });
        message.error("Error fetching citizen data:", error);
      });
  };

  return (
    <>
      <Drawer
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Edit Partner
          </span>
        }
        width={800}
        onClose={onClose}
        visible={visible}
        bodyStyle={styles.body}
        maskStyle={styles.mask}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid gap-6 m-0 p-0 md:grid-cols-2">
            <div className="formlabels rounded-md">
              <h2 className="font-bold text-lg">Partner Info</h2>
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
                    { label: "Partner", value: 2 },
                    { label: "BeeConnect", value: 1 },
                  ]}
                  placeholder="Select type"
                  disabled
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span style={styles.label}>Description</span>}
                rules={[{ required: true }]}
              >
                <Input className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500" />
              </Form.Item>
              <Form.Item
                name="website"
                label={<span style={styles.label}>Website</span>}
                rules={[
                  {
                    required: true,
                    message: "Website URL is required",
                  },
                  {
                    pattern:
                      /^(https?:\/\/)?([^\s@]+@[^\s@]+\.[^\s@]+|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/,
                    message: "Please enter a valid website URL",
                  },
                ]}
              >
                <Input
                  onBlur={(e) => {
                    let value = e.target.value.trim();
                    if (value && !/^https?:\/\//i.test(value)) {
                      value = `https://${value}`;
                    }
                    e.target.value = value;
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="email"
                label={<span style={styles.label}>Email</span>}
                rules={[
                  { required: true, message: "Please enter your email." },
                  {
                    type: "email",
                    message: "Please enter a valid email address.",
                  },
                ]}
              >
                <Input className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500" />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label={<span style={styles.label}>Phone Number</span>}
                rules={[
                  { required: true, message: "Phone number is required" },
                  {
                    validator: (_, value) => {
                      const formattedPhone = validatePhoneNumber(value);
                      if (formattedPhone) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          new Error("Invalid phone number format")
                        );
                      }
                    },
                  },
                ]}
              >
                <Input
                  maxLength={12}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="coveredDistricts"
                label={<span style={styles.label}>Covered District</span>}
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  options={districts}
                  placeholder="Select districts"
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="servicesProvided"
                label={<span style={styles.label}>Services Provided</span>}
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  options={services.map((service) => ({
                    label: service.name,
                    value: service._id,
                  }))}
                  placeholder="Select services"
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name="tinNumber"
                label={<span style={styles.label}>Tin Number</span>}
              >
                <Input
                  maxLength={9}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
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
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  onBlur={(e) => {
                    const nationalId = e.target.value;
                    if (nationalId.length === 16) {
                      fetchCitizenData(nationalId);
                    }
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name={["owner", "firstName"]}
                label={<span style={styles.label}>First Name</span>}
                rules={[{ required: true }]}
              >
                <Input
                  disabled
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name={["owner", "lastName"]}
                label={<span style={styles.label}>Last Name</span>}
                rules={[{ required: true }]}
              >
                <Input
                  disabled
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name={["owner", "phoneNumber"]}
                label={<span style={styles.label}>Phone Number</span>}
                rules={[
                  { required: true, message: "Phone number is required" },
                  {
                    validator: (_, value) => {
                      const formattedPhone = validatePhoneNumber(value);
                      if (formattedPhone) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          new Error("Invalid phone number format")
                        );
                      }
                    },
                  },
                ]}
              >
                <Input
                  maxLength={12}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                />
              </Form.Item>
              <Form.Item
                name={["owner", "email"]}
                label={<span style={styles.label}>Email</span>}
                rules={[
                  { required: true, message: "Please enter your email." },
                  {
                    type: "email",
                    message: "Please enter a valid email address.",
                  },
                ]}
              >
                <Input className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500" />
              </Form.Item>

              <Form.Item>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
                >
                  Save Changes
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

export default EditPartnerDrawer;
