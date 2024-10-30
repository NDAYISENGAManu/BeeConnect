/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Drawer,
  Form,
  Button,
  Input,
  Select,
  Modal,
  Radio,
  RadioChangeEvent,
} from "antd";
import moment from "moment";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { formatPhone } from "../helper/validation.heper";
import { Farmer } from "../types/globalData";

interface EditFarmerDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedRecord: Farmer | null;
  onFarmerUpdated: () => void;
}

const EditFarmerDrawer: React.FC<EditFarmerDrawerProps> = ({
  visible,
  onClose,
  selectedRecord,
  onFarmerUpdated,
}) => {
  const [form] = Form.useForm();
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState<
    number | null
  >(null);
  const [showEmploymentType, setShowEmploymentType] = useState<boolean>(false);
  const [businessTypes, setBusinessTypes] = useState<number>();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/geomap/upper`, {
          headers: { "x-auth-token": token },
        });
        setRegions(response.data.data);
      } catch (error) {
        // console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      form.setFieldsValue({
        ...selectedRecord,
        enterpriseName: selectedRecord?.enterpriseName || "",
        smeCategory: selectedRecord.smeCategory,
        dateOfBirth: selectedRecord.dateOfBirth
          ? moment(selectedRecord.dateOfBirth)
          : null,
        region: selectedRecord.location?.province?.name,
        district: selectedRecord.location?.district?.name,
        sector: selectedRecord.location?.sector?.name,
      });
      const selectedRegion = regions.find(
        (region) => region.name === selectedRecord.location?.province?.name
      );
      setDistricts(selectedRegion ? selectedRegion.districts : []);
      const selectedDistrict = selectedRegion?.districts.find(
        (district: { name: string }) =>
          district.name === selectedRecord.location?.district?.name
      );
      setSectors(selectedDistrict ? selectedDistrict.sectors : []);

      if (selectedRecord.businessType === 1) {
        setBusinessTypes(1);
      } else {
        setBusinessTypes(0);
      }
    }
  }, [selectedRecord, form, regions, businessTypes]);

  const farmerId = selectedRecord?.key;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    console.log("Form Values:", values);

    if (!farmerId) {
      console.error("Selected record ID is missing.");
      return;
    }

    // Ensure sector is a string, not an array
    const sectorName = Array.isArray(values.sector)
      ? values.sector[0]
      : values.sector;

    const updatedFields: Partial<Farmer> = {
      nationalId: values.nationalId,
      phoneNumber: values.phoneNumber,
      educationLevel: values.educationLevel,
      businessType: values.businessType,
      maritalStatus: values.maritalStatus,
      firstName: values.firstName,
      lastName: values.lastName,
      location: {
        province: {
          _id: selectedRecord?.location?.province?._id,
          name: values.region || selectedRecord?.location?.province?.name,
        },
        district: {
          _id: selectedRecord?.location?.district?._id,
          name: values.district || selectedRecord?.location?.district?.name,
        },
        sector: {
          _id: selectedRecord?.location?.sector?._id,
          name: sectorName || selectedRecord?.location?.sector?.name,
        },
      },
      smeCategory: values.smeCategory,
      hasDisability: values.hasDisability,
      isARefugee: values.isARefugee,
      isActiveStudent: values.isActiveStudent,
      employmentStatus: values.employmentStatus,
      employmentType: values.employmentType,
    };

    if (values.businessType === 2) {
      updatedFields.smeCategory = values.smeCategory;
    }

    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/user/id/${farmerId}`,
        updatedFields,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setStatusCode(response.status);
        setStatusMessage("Applicant details updated successfully.");
        setStatusModalVisible(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.error(
        //   "Error updating applicant details:",
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
    }
  };

  const handleModalOk = () => {
    setStatusModalVisible(false);
    onClose();
    onFarmerUpdated();
  };

  const handleRegionChange = (value: string) => {
    const selectedRegion = regions.find((region) => region.name === value);
    setDistricts(selectedRegion ? selectedRegion.districts : []);
    setSectors([]);
  };

  const handleDistrictChange = (value: string) => {
    const selectedDistrict = districts.find(
      (district) => district.name === value
    );
    setSectors(selectedDistrict ? selectedDistrict.sectors : []);
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

  const handleEmploymentStatusChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setSelectedEmploymentStatus(value);
    if (value === 1) {
      setShowEmploymentType(true);
    } else {
      setShowEmploymentType(false);
    }
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
            firstName: foreName,
            lastName: surname,
          });
        } else {
          form.setFieldsValue({
            firstName: "",
            lastName: "",
          });
          console.error("No data found for this National ID.");
        }
      })
      .catch(() => {
        // Clear the fields on error
        form.setFieldsValue({
          firstName: "",
          lastName: "",
        });
        // console.error("Error fetching citizen data:", error);
      });
  };

  return (
    <>
      <Drawer
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Edit Applicant
          </span>
        }
        width={800}
        onClose={onClose}
        open={visible}
        styles={styles}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div className="formlabels">
              <Form.Item
                name="nationalId"
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
                />
              </Form.Item>
              <Form.Item
                name="firstName"
                label={<span style={styles.label}>First Name</span>}
                rules={[{ required: true }]}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="lastName"
                label={<span style={styles.label}>Last Name</span>}
                rules={[{ required: true }]}
              >
                <Input disabled />
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
                />
              </Form.Item>
              <Form.Item
                name="educationLevel"
                label={<span style={styles.label}>Education Level</span>}
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value={1}>ABANZA</Select.Option>
                  <Select.Option value={2}>AYISUMBUNYE</Select.Option>
                  <Select.Option value={3}>IMYUGA</Select.Option>
                  <Select.Option value={4}>KAMINUZA</Select.Option>
                  <Select.Option value={5}>NTAYO</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="businessType"
                label={<span style={styles.label}>Business Type</span>}
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value={1}>Individual</Select.Option>
                  <Select.Option value={2}>SME</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="region"
                label={<span style={styles.label}>Region</span>}
                // rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  allowClear
                  onChange={handleRegionChange}
                  options={regions.map((region) => ({
                    value: region.name,
                    label: region.name,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="district"
                label={<span style={styles.label}>District</span>}
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  allowClear
                  onChange={handleDistrictChange}
                  options={districts.map((district) => ({
                    value: district.name,
                    label: district.name,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="sector"
                label={<span style={styles.label}>Sector</span>}
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={sectors.map((sector) => ({
                    value: sector.name,
                    label: sector.name,
                  }))}
                />
              </Form.Item>
            </div>
            <div className="formlabels">
              <Form.Item
                name="smeCategory"
                label={<span style={styles.label}>SME Category</span>}
                hidden={businessTypes === 1}
              >
                <Select>
                  <Select.Option value={1}>INVISCIBLE</Select.Option>
                  <Select.Option value={2}>BOOTSTRAPERS</Select.Option>
                  <Select.Option value={3}>GAZELLES</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="enterpriseName"
                label={<span style={styles.label}>Enterprise Name</span>}
                hidden={businessTypes === 1}
              >
                <Input className="rounded-none" />
              </Form.Item>
              <Form.Item
                name="hasDisability"
                label={<span style={styles.label}>Has Disability</span>}
                // rules={[{ required: true }]}
              >
                <Radio.Group className="custom-radio">
                  <Radio value="YES">Yes</Radio>
                  <Radio value="NO">No</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="isARefugee"
                label={<span style={styles.label}>Is a Refugee</span>}
                // rules={[{ required: true }]}
              >
                <Radio.Group className="custom-radio">
                  <Radio value="YES">Yes</Radio>
                  <Radio value="NO">No</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="isActiveStudent"
                label={<span style={styles.label}>Is an Active Student</span>}
                // rules={[{ required: true }]}
              >
                <Radio.Group className="custom-radio">
                  <Radio value="YES">Yes</Radio>
                  <Radio value="NO">No</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="maritalStatus"
                label={<span style={styles.label}>Marital Status</span>}
                // rules={[{ required: true }]}
              >
                <Radio.Group className="custom-radio">
                  <Radio value={1}>Single</Radio>
                  <Radio value={2}>Married</Radio>
                  <Radio value={3}>Divorced</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="employmentStatus"
                label={<span style={styles.label}>Employment Status</span>}
              >
                <Radio.Group
                  onChange={handleEmploymentStatusChange}
                  value={selectedEmploymentStatus}
                  className="custom-radio"
                >
                  <Radio value={1}>Employed</Radio>
                  <Radio value={2}>Unemployed</Radio>
                </Radio.Group>
              </Form.Item>
              {showEmploymentType && (
                <Form.Item
                  name="employmentType"
                  label={<span style={styles.label}>Employment Type</span>}
                >
                  <Select>
                    <Select.Option value={1}>Government</Select.Option>
                    <Select.Option value={2}>Private</Select.Option>
                    <Select.Option value={3}>Self Employed</Select.Option>
                    <Select.Option value={100}>Other</Select.Option>
                  </Select>
                </Form.Item>
              )}
              <Form.Item>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
                >
                  Update Applicant
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

export default EditFarmerDrawer;
