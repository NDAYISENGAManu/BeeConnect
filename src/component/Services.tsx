/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Button, Input, Modal, Select, Spin, Space, Radio } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { PlusOutlined, LoadingOutlined, EditFilled } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextArea from "antd/es/input/TextArea";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import axios from "axios";
import { ServiceType } from "../types/globalData";
import { CustomError } from "../types/globalData";
import EditServiceDrawer from "./EditServiceDrawer";

const schema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  description: z.string().min(1, "Service description is required").max(200),
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    .nonempty({ message: "Category is required" }),
  requiresLandInfo: z.string().nonempty({ message: "Please select an option" }),
});

type FormData = z.infer<typeof schema>;

const Services: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [serviceCategories, setServiceCategories] = useState<
    { _id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loadingButtons, setLoadingButtons] = useState(false);
  const { handleSubmit, control, reset, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
      fetchServices(current, pageSize);
    }
  };

  useEffect(() => {
    fetchServices(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchServices = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/service?page=${page}&size=${size}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const servicesData = response.data.data.map((service: any) => ({
        key: service._id,
        date: new Date(service.created_at).toLocaleDateString(),
        name: service.name,
        description: service.description,
        category: service.category.name,
        status: service.status,
        requiresLandInfo: service.requiresLandInfo,
      }));

      setTimeout(() => {
        setServices(servicesData);
        setTotalItems(response.data.meta.total);
        setLoading(false);
      }, 1000);
    } catch (error) {
      // message.error("Failed to fetch services");
      setLoading(false);
    }
  };

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

  const handleFormSubmit = async (data: FormData) => {
    setLoadingButtons(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/service`,
        {
          name: data.name,
          category: data.category,
          description: data.description,
          requiresLandInfo: data.requiresLandInfo,
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      // Handle success (status code 200 or 201)
      if (response.status === 200 || response.status === 201) {
        setStatusMessage("The Service has been added successfully.");
        setStatusCode(response.status);

        setIsModalVisible(false);
        setIsSuccessModalVisible(true);
        reset();
        fetchServices(currentPage, pageSize);

        return response;
      } else {
        throw new Error("Failed to add Service");
      }
    } catch (error) {
      const customError = error as CustomError;
      setStatusCode(customError?.status || 500);

      // Handle specific status codes
      if (customError?.status === 409) {
        setStatusMessage(
          "Conflict. A Service with the same details already exists."
        );
      } else if (customError?.status === 401) {
        setStatusMessage("Unauthorized access. Please log in.");
      } else if (customError?.status === 403) {
        setStatusMessage(
          "Forbidden. You do not have permission to add a partner."
        );
      } else {
        setStatusMessage("An error occurred. Please try again.");
      }

      setIsSuccessModalVisible(true);
    } finally {
      setLoadingButtons(false);
      setIsModalVisible(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const formData = getValues();
      const response = await handleFormSubmit(formData);

      // Handle status after form submission
      if (response && (response.status === 200 || response.status === 201)) {
        setStatusMessage("The Service has been added successfully.");
        setStatusCode(response.status);
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
    } finally {
      setIsModalVisible(false);
      setIsSuccessModalVisible(true);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccessModalOk = () => {
    setIsSuccessModalVisible(false);
    setIsSuccessModalVisible(false);
    setStatusMessage("");
    setStatusCode(null);
    reset();
  };

  const handleEdit = (service: ServiceType) => {
    setSelectedService(service);
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedService(null);
  };

  const columns: ColumnsType<ServiceType> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div
          style={{
            width: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status: number) => {
        let statusText;
        let statusClass;

        switch (status) {
          case 3:
            statusText = "Approved";
            statusClass = "status-active";
            break;
          case 2:
            statusText = "Pending";
            statusClass = "status-pending-live";
            break;
          case 1:
            statusText = "Rejected";
            statusClass = "status-inactive";
            break;
          default:
            statusText = "Unknown";
            statusClass = "status-unknown";
        }
        return <span className={statusClass}>{statusText}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle" className="gap-1">
          <Button
            className="text-[#FFA928] border-1 rounded-none"
            icon={<EditFilled className="text-[#FFA928]" />}
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  const handleServiceUpdated = () => {
    fetchServices();
  };

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
        <h2 className="text-md lg:text-xl font-bold">Services</h2>
        <button
          className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
          onClick={showModal}
        >
          <span className="text-md md:text-md font-bold">
            <PlusOutlined />
          </span>{" "}
          Add Service
        </button>
      </div>
      <div className="overflow-auto">
        <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
        <Table
          columns={columns}
          dataSource={services}
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
          loading={{
            spinning: loading,
            indicator: (
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 24, color: "#0C743F" }}
                    spin
                  />
                }
              />
            ),
          }}
        />
        <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
      </div>
      <Modal
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Add new Service
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        styles={styles}
        footer={null}
      >
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          <div>
            <label className="block mb-2 text-sm font-bold text-[#0C743F]">
              <span className="font-bold text-xl text-[#FF0000]">* </span>
              Service Name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    {...field}
                    placeholder="Enter service name"
                    className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-[#0C743F]">
              <span className="font-bold text-xl text-[#FF0000]">* </span>
              Service Category
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Select
                    {...field}
                    placeholder="Select category"
                    className="border-gray-500 w-full rounded-none border focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                    options={serviceCategories.map((category) => ({
                      value: category._id,
                      label: category.name,
                    }))}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-[#0C743F]">
              <span className="font-bold text-xl text-[#FF0000]">* </span>
              Service Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TextArea
                    {...field}
                    placeholder="Enter service description"
                    className="border-gray-500 w-full rounded-none border focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-[#0C743F]">
              <span className="font-bold text-xl text-[#FF0000]">* </span>
              Requires Land Info
            </label>
            <Controller
              name="requiresLandInfo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Radio.Group {...field}>
                    <Radio value="YES">Yes</Radio>
                    <Radio value="NO">No</Radio>
                  </Radio.Group>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex">
            <button
              type="submit"
              disabled={loadingButtons}
              className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
            >
              {loadingButtons ? (
                <>
                  <span>Add Service</span>
                  <Spin
                    className="ml-5"
                    indicator={
                      <LoadingOutlined
                        spin
                        className="text-black font-extrabold"
                      />
                    }
                  />
                </>
              ) : (
                <span>Add Service</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={isSuccessModalVisible}
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
      <EditServiceDrawer
        visible={isDrawerVisible}
        selectedRecord={selectedService}
        onClose={handleDrawerClose}
        onServiceUpdated={handleServiceUpdated}
      />
    </>
  );
};

export default Services;
