/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Spin, message, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { api } from "../api";
import TextArea from "antd/es/input/TextArea";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";

interface Service {
  _id: string;
  name: string;
  description: string;
}

interface Organization {
  _id: string;
  name: string;
  servicesProvided: { _id: string; name: string }[];
}

interface GroupTransferModalProps {
  visible: boolean;
  selectedRecords: string[];
  onCancel: () => void;
  onApplicationUpdate: () => void;
}

const GroupTransferModal: React.FC<GroupTransferModalProps> = ({
  visible,
  selectedRecords,
  onCancel,
  onApplicationUpdate,
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [selectedServiceDetails, setSelectedServiceDetails] =
    useState<Service | null>(null);
  const [transferReason, setTransferReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get("/api/v1/organization");
      const orgData = response.data.data.map((org: any) => ({
        _id: org._id,
        name: org.name,
        servicesProvided: org.servicesProvided,
      }));
      setOrganizations(orgData);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchServiceDetails = async (serviceId: string) => {
    try {
      const response = await api.get(`/api/v1/service/${serviceId}`);
      const serviceDetails = response.data.data;
      setSelectedServiceDetails({
        _id: serviceDetails._id,
        name: serviceDetails.name,
        description: serviceDetails.description,
      });
    } catch (error) {
      console.error("Error fetching service details:", error);
    }
  };

  useEffect(() => {
    fetchServiceDetails(serviceId);
  }, []);

  const onSelectOrganization = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    setOrganizationId(orgId);
    setServiceId("");
    setSelectedServiceDetails(null);
    const selectedOrganization = organizations.find((org) => org._id === orgId);
    setServices(
      selectedOrganization ? selectedOrganization.servicesProvided : []
    );
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceId = e.target.value;
    setServiceId(selectedServiceId);
    fetchServiceDetails(selectedServiceId);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTransferReason(e.target.value);
  };

  const handleSubmit = async () => {
    if (!organizationId || !serviceId) {
      message.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const payload: any = {
      serviceId,
      partnerId: organizationId,
      applications: selectedRecords,
    };

    // Only include transferReason if it has a value
    if (transferReason.trim()) {
      payload.transferReason = transferReason;
    }

    try {
      const response = await api.put("/api/v1/application/transfer", payload);
      if (response && (response.status === 200 || response.status === 201)) {
        setStatusMessage("The applications transfered successfully.");
        setStatusCode(response.status);
        setIsSuccessModalVisible(true);
      }
    } catch (error: any) {
      const apiErrorMessage =
        error?.response?.data?.message ||
        "Failed to transfer applications. Please try again.";
      setStatusMessage(apiErrorMessage);
      setStatusCode(error?.response?.status || 500);
      setIsSuccessModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
  };

  const handleSuccessModalOk = () => {
    onCancel();
    setIsSuccessModalVisible(false);
    setStatusMessage("");
    setStatusCode(null);
    onApplicationUpdate();
  };

  return (
    <>
      <Modal
        visible={visible}
        onCancel={onCancel}
        footer={null}
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            APPLICATIONS TRANSFER
          </span>
        }
        width={800}
        styles={styles}
      >
        <h2 className="my-10">
          This will help you transfer this application to another BeeConnect
          partner who you think can assist the applicant better!
        </h2>

        <Form layout="vertical" onFinish={handleSubmit}>
          <div className="grid gap-6 m-0 p-0 md:grid-cols-2">
            {selectedRecords && (
              <div className="flex items-center justify-center bg-[#ECF4F0] py-10 rounded-none text-center">
                <div>
                  <p>
                    <strong>Application Details</strong>
                  </p>
                  <p>Applications to transfer:</p>
                  <p className="font-extrabold text-4xl">
                    <strong className="font-bold">
                      {JSON.stringify(selectedRecords.length)}
                    </strong>
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-md">
              <div className="mb-3">
                <Form.Item
                  name="organization"
                  label={
                    <span style={{ color: "#0C743F", fontWeight: "bold" }}>
                      Organization
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select an organization!",
                    },
                  ]}
                >
                  <select
                    name="organizationId"
                    value={organizationId}
                    onChange={onSelectOrganization}
                    className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((organization) => (
                      <option key={organization._id} value={organization._id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </Form.Item>

                <Form.Item
                  name="service"
                  label={
                    <span style={{ color: "#0C743F", fontWeight: "bold" }}>
                      Service
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a service!" },
                  ]}
                >
                  <select
                    name="serviceId"
                    value={serviceId}
                    onChange={handleServiceChange}
                    className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full"
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </Form.Item>

                <Form.Item
                  name="transferReason"
                  label={
                    <span style={{ color: "#0C743F", fontWeight: "bold" }}>
                      Transfer Reason
                    </span>
                  }
                >
                  <TextArea
                    value={transferReason}
                    onChange={handleReasonChange}
                    className="rounded-none"
                  />
                </Form.Item>
              </div>

              <div className="rounded-none text-center bg-[#ECF4F0] pt-3 pr-3 pl-3 pb-1">
                <h1>
                  <strong>SERVICE DETAILS</strong>
                </h1>
                {selectedServiceDetails ? (
                  <>
                    <p>
                      <strong>Name:</strong> {selectedServiceDetails.name}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedServiceDetails.description}
                    </p>
                  </>
                ) : (
                  <p>Please select a service to view details.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-end">
            <button
              type="submit"
              className="bg-[#0C743F] text-white hover:text-[#0C743F] w-[48.5%] hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>CONFIRM</span>
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
                <span>CONFIRM</span>
              )}
            </button>
          </div>
        </Form>
      </Modal>
      <Modal
        visible={isSuccessModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
        styles={styles}
        footer={null}
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
                onClick={handleSuccessModalOk}
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
                onClick={handleSuccessModalOk}
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

export default GroupTransferModal;
