/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Space, Button, Spin, Modal } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  PlusOutlined,
  RightOutlined,
  LoadingOutlined,
  EditFilled,
  EyeFilled,
} from "@ant-design/icons";
import axios from "axios";
import EditPartnerDrawer from "./EditPartnerDrawer";
import PartnerForm from "./OrganizationForm";
import { Partner } from "../types/globalData";

const Partners: React.FC = () => {
  const [isAddingPartner, setIsAddingPartner] = useState<boolean>(false);
  const [data, setData] = useState<Partner[]>([]);
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Partner | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);

  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
  const token = localStorage.getItem("token") as string;

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

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchData = async (page: number = 1, size: number = 15) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/organization?page=${page}&size=${size}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status === 200) {
        const fetchedData = Array.isArray(response.data.data)
          ? response.data.data.map((item: any) => ({
              ...item,
              name: item.name.toUpperCase(),
              id: item.id,
            }))
          : [];
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setData(fetchedData);
        setTotalItems(response.data.meta.total);
      } else {
        // message.error("Failed to fetch data");
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
      // message.error("Failed to fetch services");
    }
  };

  const handleEdit = (organization: Partner) => {
    setSelectedOrganization(organization);
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedOrganization(null);
  };

  const handlePartnerUpdate = () => {
    fetchData();
  };

  const handleView = (record: Partner) => {
    setSelectedOrganization(record);
    const {
      name,
      type,
      description,
      website,
      email,
      phoneNumber,
      owner,
      adminInfo,
      tinNumber,
      servicesProvided,
      coveredDistricts,
    } = record;

    setPreviewData({
      name,
      type,
      description,
      website,
      email,
      phoneNumber,
      owner: owner || {},
      adminInfo: adminInfo || {},
      tinNumber,
      servicesProvided,
      coveredDistricts,
    });
    setIsModalVisible(true);
  };

  const handleCancelPreview = () => {
    setIsModalVisible(false);
    setPreviewData(null);
  };

  const columns: ColumnsType<Partner> = [
    {
      title: "Partner",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "18%",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      render: (owner: Partner["owner"]) =>
        owner ? `${owner.firstName} ${owner.lastName}` : "N/A",
    },
    {
      title: "Admin Info",
      dataIndex: "adminInfo",
      key: "adminInfo",
      render: (adminInfo: Partner["adminInfo"]) =>
        adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={
            status === "ACTIVE"
              ? "status-active"
              : status === "DEACTIVATE"
              ? "status-inactive"
              : "status-pending-live"
          }
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_text, record) => (
        <Space size="middle" className="gap-1">
          <Button
            className="text-[#00AD45] border-1 rounded-none"
            icon={<EyeFilled className="text-[#00AD45]" />}
            size="small"
            onClick={() => handleView(record)}
          />
          <Button
            className="text-[#FFA928] border-1 rounded-none"
            icon={<EditFilled className="text-[#FFA928]" />}
            onClick={() => handleEdit(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  const showTable = () => {
    setIsAddingPartner(false);
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
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-md lg:text-xl font-bold">
          <button onClick={showTable}>Partners</button>
          {isAddingPartner && (
            <span>
              <RightOutlined className="flex-shrink-0 w-3 h-3 text-gray-500 transition duration-75 mx-1 md:mx-2" />
              Add Partner
            </span>
          )}
        </h2>
        {!isAddingPartner && (
          <button
            className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
            onClick={() => setIsAddingPartner(true)}
          >
            <span className="text-md md:text-xl font-bold">
              <PlusOutlined />
            </span>{" "}
            Add Partner
          </button>
        )}
      </div>
      {!isAddingPartner ? (
        <>
          <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            className="mt-4"
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
                      className="rounded-none p-0 border-none"
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
            onChange={handleTableChange}
          />
          <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
        </>
      ) : (
        <PartnerForm
          services={services ?? []}
          fetchData={fetchData}
          onPartnerAdded={() => setIsAddingPartner(false)}
        />
      )}
      <EditPartnerDrawer
        selectedRecord={selectedOrganization}
        onClose={handleDrawerClose}
        visible={isDrawerVisible}
        onPartnerUpdate={handlePartnerUpdate}
      />
      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={handleCancelPreview}
        footer={null}
        styles={styles}
        closeIcon={null}
      >
        {previewData && (
          <div>
            <p style={{ color: "#0C743F", fontSize: "20px" }}>
              <legend>{previewData.name} Details</legend>
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {previewData.type === 1 ? "Agra" : "Partner"}
            </p>
            <p>
              <strong>Description:</strong> {previewData.description}
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a href={previewData.website} target="_blank" rel="noreferrer">
                {previewData.website}
              </a>
            </p>
            <p>
              <strong>Email:</strong> {previewData.email}
            </p>
            <p>
              <strong>Phone Number:</strong> {previewData.phoneNumber}
            </p>
            <p>
              <strong>Services Provided:</strong>{" "}
              {previewData.servicesProvided
                .map((service: any) => service.name)
                .join(", ")}
            </p>
            <p>
              <strong>Covered Districts:</strong>{" "}
              {previewData.coveredDistricts
                .map((district: any) => district.name)
                .join(", ")}
            </p>
            <p>
              <strong>TIN Number:</strong> {previewData.tinNumber}
            </p>
            <p>
              <strong>Owner:</strong>
            </p>
            <hr />
            <ul>
              <li>
                {" "}
                <strong>Names:</strong> {""}
                {previewData.owner
                  ? `${previewData.owner.firstName} ${previewData.owner.lastName}`
                  : "N/A"}
              </li>
              <li>
                <strong>Email:</strong> {""}
                {previewData.owner.email}
              </li>
              <li>
                <strong>Phonenumber:</strong> {""}
                {previewData.owner.phoneNumber}
              </li>
              <li>
                <strong>National ID:</strong> {""}
                {previewData.owner.nationalId}
              </li>
            </ul>
            <p>
              <strong>Admin Info:</strong>
            </p>
            <hr />
            <ul>
              <li>
                {" "}
                <strong>Names:</strong> {""}
                {previewData.adminInfo
                  ? `${previewData.adminInfo.firstName} ${previewData.adminInfo.lastName}`
                  : "N/A"}
              </li>
              <li>
                <strong>Email:</strong> {""}
                {previewData.adminInfo.email}
              </li>
              <li>
                <strong>Phonenumber:</strong> {""}
                {previewData.adminInfo.phoneNumber}
              </li>
              <li>
                <strong>National ID:</strong> {""}
                {previewData.adminInfo.nationalId}
              </li>
            </ul>
          </div>
        )}
        <div className="flex items-center justify-center w-full">
          <button
            key="cancel"
            onClick={handleCancelPreview}
            className="w-[32%] sm:w-full text-[#757575] font-bold rounded-none border py-2 hover:text-[#0C743F] hover:border-[#0C743F]"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Partners;
