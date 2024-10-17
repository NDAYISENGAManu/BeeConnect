import React, { useState, useEffect } from "react";
import { Input, Spin, Modal, Table, TablePaginationConfig, Button } from "antd";
import successImage from "../assets/success.svg";
import errorImage from "../assets/ico_error.svg";
import axios from "axios";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Service name is required"),
});

interface FormData {
  name: string;
}

interface ServiceCategory {
  _id: string;
  name: string;
  createdBy: {
    name: string;
  };
  created_at: string | number | Date;
}

const ServiceCategory: React.FC = () => {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    []
  );
  const [loadingButtons, setLoadingButtons] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  // const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormData>({
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
      fetchServiceCategories(current, pageSize);
    }
  };

  useEffect(() => {
    fetchServiceCategories(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchServiceCategories = async (
    page: number = 1,
    size: number = 15
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/service-category?page=${page}&size=${size}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setServiceCategories(response.data.data);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching service categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddServiceCategory = async (data: FormData) => {
    const nameExists = serviceCategories.some(
      (category) => category.name.toLowerCase() === data.name.toLowerCase()
    );

    if (nameExists) {
      setError("name", {
        type: "manual",
        message: "Service category name already exists",
      });
      return;
    }

    setLoadingButtons(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/service-category`,
        data,
        {
          headers: { "x-auth-token": token },
        }
      );
      setStatusMessage("Service category added successfully!");
      setStatusCode(response.status);
      setIsMessageModalVisible(true);
      reset();
      fetchServiceCategories();
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
      setIsMessageModalVisible(true);
    } finally {
      setLoadingButtons(false);
      setIsFormModalVisible(false);
    }
  };

  const handleSuccessModalOk = () => {
    setIsMessageModalVisible(false);
    setStatusMessage("");
    setStatusCode(null);
  };

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
  };

  const columns = [
    {
      title: "Service Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Created By",
      dataIndex: ["createdBy", "name"],
      key: "createdBy",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string | number | Date) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-md lg:text-xl font-bold">Service Categories</h2>
        <button
          className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
          onClick={() => setIsFormModalVisible(true)}
        >
          <span className="text-md md:text-md font-bold">
            <PlusOutlined />
          </span>{" "}
          Add New Service Category
        </button>
      </div>
      <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
      <div className="mt-4">
        <Table
          dataSource={serviceCategories}
          columns={columns}
          rowKey="_id"
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
          scroll={{ x: "max-content" }}
        />
      </div>
      <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
      <Modal
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Add a new Category
          </span>
        }
        styles={styles}
      >
        <form onSubmit={handleSubmit(handleAddServiceCategory)}>
          <div className="text-left block mb-2 text-sm text-[#0C743F]">
            <label className="block mb-2 text-sm font-bold text-[#0C743F]">
              <span className="font-bold text-xl text-[#FF0000]">* </span>
              Service Category name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  // className="border border-solid h-10 w-full bg-white"
                  className="border-gray-500 w-full rounded-none border focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                  placeholder="Service Category Name"
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="flex">
            <button
              type="submit"
              disabled={loadingButtons}
              className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
            >
              {loadingButtons ? (
                <>
                  <span>Add Service Category</span>
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
                <span className="text-md">Add Service Category</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={isMessageModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
        styles={styles}
        footer={null}
      >
        {statusCode === 200 || statusCode === 201 ? (
          <>
            <div className="center-container font-bold">
              <img src={successImage} alt="" className="mt-10" />
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
              <img src={errorImage} alt="" className="mt-10" />
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

export default ServiceCategory;
