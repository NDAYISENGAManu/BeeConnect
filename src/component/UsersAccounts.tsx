/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Space, Button, Input, Form, Modal, Select, Spin } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  // EyeOutlined,
  RightOutlined,
  LoadingOutlined,
  PlusOutlined,
  EyeFilled,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { formatPhone } from "../helper/validation.heper";
import { Organization, Users } from "../types/globalData";
import { useAuth } from "../context/AuthContext";

const validatePhoneNumber = (phoneNumber: string) => {
  const formattedPhone = formatPhone(phoneNumber);
  return formattedPhone ? formattedPhone : null;
};

const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  nationalId: z.string().min(16, { message: "National ID is required" }),
  phoneNumber: z.string().refine((val) => validatePhoneNumber(val) !== null, {
    message: "Invalid phone number",
  }),
  role: z.string().min(1, { message: "Role is required" }),
  organization: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const UsersAccounts: React.FC = () => {
  const [isAddingUsers, setIsAddingUsers] = useState(false);
  const [data, setData] = useState<Users[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [nidError, setNidError] = useState<string | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>(undefined);
  const [selectedOrgName, setSelectedOrgName] = useState<string | undefined>(
    undefined
  );

  const showAddModal = () => {
    setAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setAddModalVisible(false);
    reset();
  };

  const {
    organizationType,
    organizationId: authOrgId,
    organizationName: authOrgName,
    userType,
  } = useAuth();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    watch,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
      fetchData(current, pageSize);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Fetch organizations if needed (when organizationType == 1)
  useEffect(() => {
    if (organizationType === 1) {
      fetchOrganizations();
    }
  }, [organizationType]);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/organization`, {
        headers: { "x-auth-token": token },
      });
      const orgData: Organization[] = response.data.data.map((org: any) => ({
        _id: org._id,
        name: org.name,
      }));
      setOrganizations(orgData);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchData = async (page: number = 1, size: number = 15) => {
    setLoading(true);
    try {
      const userResponse = await axios.get(
        `${baseUrl}/api/v1/user?page=${page}&size=${size}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const users = userResponse.data.data.data.map((user: any) => ({
        key: user._id,
        date: new Date(user.created_at).toLocaleDateString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        nationalId: user.nationalId,
        phoneNumber: user.phoneNumber,
        organization: user.organization?.name,
        role: user.role,
        userType: user.userType,
      }));

      setData(users);
      setTotalItems(userResponse.data.data.meta.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const nid = watch("nationalId");

  useEffect(() => {
    if (nid && nid.length === 16) {
      fetchOwnerIData(nid);
    }
  }, [nid]);

  const fetchOwnerIData = async (nationalId: string) => {
    setLoadingOwner(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/user/citizen`,
        { nationalId },
        {
          headers: { "x-auth-token": token },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { nidExists, foreName, surname } = response.data.data;

      if (nidExists) {
        setError("nationalId", {
          type: "manual",
          message: "National ID has been used.",
        });
      } else {
        setValue("firstName", foreName);
        setValue("lastName", surname);
        clearErrors();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError("nationalId", {
          type: "manual",
          message: "National ID not found.",
        });
      } else {
        console.error("Error fetching citizen data:", error);
        setError("nationalId", {
          type: "manual",
          // message: "Error fetching data. Please try again.",
        });
      }
    } finally {
      setLoadingOwner(false);
    }
  };

  const showTable = () => {
    setIsAddingUsers(false);
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (formData) {
      setLoading(true);

      const organizationData =
        organizationType === 1
          ? {
              _id: selectedOrg,
              name: selectedOrgName,
            }
          : {
              _id: authOrgId,
              name: authOrgName,
            };

      const userData = {
        ...formData,
        organization: organizationData,
        phoneNumber: formatPhone(formData.phoneNumber),
        userType: userType,
      };

      try {
        const response = await axios.post(`${baseUrl}/api/v1/user`, userData, {
          headers: { "x-auth-token": token },
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStatusCode(response.status);
        setStatusMessage("User account added successfully");
        setIsSuccessModalVisible(true);
        fetchData();
        setAddModalVisible(false);
        reset();
      } catch (error: any) {
        console.error("Error creating user:", error);
        setStatusCode(error.response?.status || 500);
        setStatusMessage("An error occurred while adding the user.");
        setIsSuccessModalVisible(true);
        setAddModalVisible(false);
      } finally {
        setLoading(false);
        setAddModalVisible(false);
      }
    }
  };

  const handleView = (user: Users) => {
    setSelectedUser(user);
    setIsViewModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccessModalOk = () => {
    setIsSuccessModalVisible(false);
  };

  const columns: ColumnsType<Users> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Organization",
      dataIndex: "organization",
      key: "organization",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: number) => {
        let statusText;
        switch (role) {
          case 1:
            statusText = "Super-Admin";
            break;
          case 2:
            statusText = "Admin";
            break;
          case 3:
            statusText = "Normal-user";
            break;
          default:
            statusText = "Unknown";
        }
        return <span>{statusText}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle" className="gap-1 justify-start items-center flex">
          <EyeFilled
            onClick={() => handleView(record)}
            style={{ fontSize: "20px", color: "#0C743F" }}
            className="border px-1"
          />
        </Space>
      ),
    },
  ];

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-md lg:text-xl font-bold">
          <button onClick={showTable}>Users</button>
          {isAddingUsers && (
            <span>
              {" "}
              <RightOutlined className="flex-shrink-0 w-3 h-3 text-gray-500 transition duration-75 mx-1 md:mx-2" />
              Add User
            </span>
          )}
        </h2>
        {!isAddingUsers && (
          <button
            className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
            onClick={showAddModal}
          >
            <span className="text-md md:text-xl font-bold">
              <PlusOutlined />
            </span>{" "}
            Add User Accounts
          </button>
        )}
      </div>
      <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin
            className="ml-5"
            indicator={
              <LoadingOutlined spin className=" text-[#000] font-extrabold" />
            }
          />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showTotal: (total) => `Total ${total} items`,
            itemRender: (page, type, originalElement) => {
              if (type === "page") {
                return (
                  <a
                    className="p-0 border-none"
                    style={{
                      color: page === currentPage ? "white" : "#fff",
                      background: page === currentPage ? "#000" : "#9c9c9c",
                      border: "0px",
                    }}
                  >
                    {page}
                  </a>
                );
              }
              return originalElement;
            },
          }}
          onChange={handleTableChange}
        />
      )}
      <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>

      <Modal
        visible={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleAddCancel}
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Confirm User Information
          </span>
        }
        styles={styles}
        footer={null}
      >
        <div>
          <p style={{ textAlign: "left" }} className="py-2">
            Please provide the following required information to add a user
            account
          </p>
          <Form onFinish={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-6 mb-6 md:grid-cols">
              <div className="formlabels">
                <h2 className="font-bold text-lg">User Info</h2>
                {organizationType === 1 && (
                  <div>
                    <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                      <span className="font-bold text-xl text-[#FF0000]">
                        *{" "}
                      </span>
                      Organization
                    </label>
                    <Controller
                      name="organization"
                      control={control}
                      rules={{ required: "Organization is required" }}
                      render={({ fieldState }) => (
                        <div>
                          <Select
                            placeholder="Select Organization"
                            value={selectedOrg}
                            onChange={(value) => {
                              setSelectedOrg(value); // set selected organization id
                              const selectedOrg = organizations.find(
                                (org) => org._id === value
                              );
                              setSelectedOrgName(selectedOrg?.name || ""); // set selected organization name
                            }}
                            className="border border-gray-500 h-10 rounded-none w-full bg-white"
                          >
                            {organizations.map((org) => (
                              <Select.Option key={org._id} value={org._id}>
                                {org.name}
                              </Select.Option>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <span className="text-red-500">
                              {fieldState.error.message}
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                  Owner National ID
                </label>
                <Controller
                  name="nationalId"
                  control={control}
                  rules={{
                    required: "National ID is required",
                    pattern: {
                      value: /^\d{16}$/,
                      message: "National ID must be exactly 16 digits",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="Enter national ID"
                        maxLength={16}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                          setNidError(null);
                        }}
                        onBlur={() => fetchOwnerIData(field.value)}
                        className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                        suffix={
                          loadingOwner ? (
                            <Spin
                              indicator={
                                <LoadingOutlined
                                  style={{ fontSize: 24, color: "#0C743F" }}
                                  spin
                                />
                              }
                            />
                          ) : null
                        }
                      />
                      {nidError && (
                        <p className="error-message text-red-500">{nidError}</p>
                      )}
                      {fieldState.error && (
                        <p className="error-message text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                  First Name
                </label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="Enter first name"
                        className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                        readOnly
                        disabled
                      />
                      {fieldState.error && (
                        <span className="text-red-500">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                  Last Name
                </label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="Enter last name"
                        className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                        readOnly
                        disabled
                      />
                      {fieldState.error && (
                        <span className="text-red-500">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                  Email
                </label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="Enter email"
                        onBlur={() => field.onBlur()}
                        className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      />
                      {fieldState.error && (
                        <span className="text-red-500">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />

                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                  Phone Number
                </label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^\d{1,12}$/,
                      message:
                        "Phone number must be up to 12 digits and contain no letters or special characters",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="Enter phone number"
                        maxLength={12}
                        onChange={(e) => {
                          // Prevent input of anything other than digits
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                        onBlur={() => field.onBlur()}
                        className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      />
                      {fieldState.error && (
                        <span className="text-red-500">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />

                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                  Role
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Select
                        {...field}
                        placeholder="Select role"
                        className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                        options={[
                          { value: "2", label: "Admin" },
                          { value: "3", label: "User" },
                        ]}
                      />
                      {fieldState.error && (
                        <p className="error-message text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <div className="flex items-center justify-between my-5 gap-3">
                  <div className="flex w-full">
                    <button
                      className="bg-[#0C743F] py-2 w-full text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu font-bold"
                      onClick={handleSubmit(handleFormSubmit)}
                    >
                      Submit
                    </button>
                  </div>
                  <div className="flex w-full">
                    <button
                      onClick={showTable}
                      className="w-full py-2 border border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Confirm User Information
          </span>
        }
        styles={styles}
        width={500}
        footer={null}
        closeIcon={null}
      >
        <p>
          <strong>First Name:</strong> {formData?.firstName}
        </p>
        <p>
          <strong>Last Name:</strong> {formData?.lastName}
        </p>
        <p>
          <strong>Email:</strong> {formData?.email}
        </p>
        <p>
          <strong>Phone Number:</strong> {formData?.phoneNumber}
        </p>
        <p>
          <strong>Organization:</strong>
        </p>
        <p>
          <strong>Role:</strong>{" "}
          {(() => {
            switch (formData?.role) {
              case 2:
                return "Admin";
              case 3:
                return "User";
              default:
                return "Unknown Role";
            }
          })()}
        </p>
        <p>
          <strong>User Type:</strong> Organisation User
        </p>
        <div className="flex items-center justify-between">
          <Button
            key="cancel"
            onClick={handleModalCancel}
            className="lg:w-[32%] sm:w-full p-5 text-[#757575] font-bold rounded-none"
          >
            OK
          </Button>
          <Button
            key="ok"
            onClick={handleModalOk}
            className="lg:w-[32%] sm:w-full p-5 bg-[#0C743F] text-white font-bold rounded-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <span>CONFIRM</span>{" "}
                <Spin className="ml-2" indicator={<LoadingOutlined spin />} />
              </>
            ) : (
              "CONFIRM"
            )}
          </Button>
        </div>
      </Modal>
      <Modal
        visible={isSuccessModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
        styles={styles}
        width={500}
        footer={null}
        closeIcon={null}
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
      <Modal
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            User Details
          </span>
        }
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        styles={styles}
      >
        {selectedUser && (
          <div>
            <p>
              <strong>Date:</strong> {selectedUser.date}
            </p>
            <p>
              <strong>First Name:</strong> {selectedUser.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedUser.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Phone Number:</strong> {selectedUser.phoneNumber}
            </p>
            <p>
              <strong>Organization:</strong> {selectedUser.organization}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              {(() => {
                switch (selectedUser?.role) {
                  case 1:
                    return "Super Admin";
                  case 2:
                    return "Admin";
                  case 3:
                    return "User";
                  default:
                    return "Unknown Role";
                }
              })()}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button
            key="cancel"
            onClick={() => setIsViewModalVisible(false)}
            className="lg:w-[32%] sm:w-full p-5 text-[#757575] font-bold rounded-none"
          >
            OK
          </Button>
          <Button
            key="ok"
            onClick={() => setIsViewModalVisible(false)}
            className="lg:w-[32%] sm:w-full p-5 bg-[#0C743F] text-white font-bold rounded-none"
          >
            CONFIRM
          </Button>
        </div>
      </Modal>
    </>
  );
};
export default UsersAccounts;
