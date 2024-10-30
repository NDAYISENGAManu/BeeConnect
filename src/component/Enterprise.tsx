/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Spin, Space } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  PlusOutlined,
  LoadingOutlined,
  EditFilled,
  EyeFilled,
} from "@ant-design/icons";
import axios from "axios";
import { EnterpriseEditTypes, EnterpriseTypes } from "../types/globalData";
import EditEnterpriseDrawer from "./EditEnterpriseDrawer";
import EnterpriseForm from "./EnterpriseForm";
import { getEnterpriseCategory, getSmeCategory } from "../types/utils";
import { checkHasPolicy } from "../helper/app.helper";

const Enterprise: React.FC = () => {
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [enterprise, setEnterprise] = useState<EnterpriseTypes[]>([]);
  const [selectedEnterprise, setSelectedEnterprise] =
    useState<EnterpriseEditTypes | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  // const [isAddingEnterprise, setIsAddingEnterprise] = useState<boolean>(false);
  const [isEnterpriseModalVisible, setEnterpriseModalVisible] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
      fetchEnterprise(current, pageSize);
    }
  };

  useEffect(() => {
    fetchEnterprise(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchEnterprise = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/enterprise?page=${page}&size=${size}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const EnterpriseData = response.data.data.map((enterprise: any) => ({
        key: enterprise._id,
        date: new Date(enterprise.created_at).toLocaleDateString(),
        name: enterprise.name,
        tinNumber: enterprise.tinNumber,
        type: enterprise.type,
        totalYouthEmployed: enterprise.totalYouthEmployed,
        noOfYouthRefugees: enterprise.noOfYouthRefugees,
        noOfYouthIDPs: enterprise.noOfYouthIDPs,
        noOfYouthPLWDs: enterprise.noOfYouthPLWDs,
        smeCategory: enterprise.smeCategory,
        owner: {
          firstName: enterprise.owner.firstName,
          lastName: enterprise.owner.lastName,
          phoneNumber: enterprise.owner.phoneNumber,
          nationalId: enterprise.owner.nationalId,
        },
        subPartners: enterprise.subPartners,
      }));

      setTimeout(() => {
        setEnterprise(EnterpriseData);
        setTotalItems(response.data.meta.total);
        setLoading(false);
      }, 1000);
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (enterprise: EnterpriseEditTypes) => {
    setSelectedEnterprise(enterprise);
    setIsDrawerVisible(true);
  };

  const showEnterpriseModal = () => {
    setEnterpriseModalVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedEnterprise(null);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "5%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tin No",
      dataIndex: "tinNumber",
      key: "tinNumber",
      width: "5%",
    },
    {
      title: "Youth Employed",
      dataIndex: "totalYouthEmployed",
      key: "totalYouthEmployed",
      width: "9%",
    },
    {
      title: "Youth Refugees",
      dataIndex: "noOfYouthRefugees",
      key: "noOfYouthRefugees",
      width: "9%",
    },
    {
      title: "Youth IDP's",
      dataIndex: "noOfYouthIDPs",
      key: "noOfYouthIDPs",
      width: "9%",
    },
    {
      title: "Youth PLWD's",
      dataIndex: "noOfYouthPLWDs",
      key: "noOfYouthPLWDs",
      width: "9%",
    },
    {
      title: "SME Category",
      dataIndex: "smeCategory",
      key: "smeCategory",
      width: "9%",
      render: (smeCategory: any) => getSmeCategory(smeCategory),
    },
    {
      title: "Owner Details",
      dataIndex: "owner",
      key: "owner",
      render: (owner: EnterpriseEditTypes["owner"]) =>
        owner ? `${owner.firstName} ${owner.lastName}` : "N/A",
    },
    {
      title: "Sub-Partners",
      dataIndex: "subPartners",
      key: "subPartners",
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
          {!hasAccess([], [1, 2], [1]) && (
            <Button
              className="text-[#FFA928] border-1 rounded-none"
              icon={<EditFilled className="text-[#FFA928]" />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          )}
        </Space>
      ),
    },
  ];

  const handleEnterpriseUpdate = () => {
    fetchEnterprise();
    setLoading(false);
  };

  const handleView = (record: EnterpriseEditTypes) => {
    setSelectedEnterprise(record);
    const {
      name,
      type,
      tinNumber,
      noOfYouthRefugees,
      noOfYouthIDPs,
      noOfYouthPLWDs,
      totalYouthEmployed,
      owner: { nationalId, firstName, lastName, phoneNumber },
      subPartners,
      smeCategory,
    } = record;

    setPreviewData({
      name,
      type,
      tinNumber,
      noOfYouthRefugees,
      noOfYouthIDPs,
      noOfYouthPLWDs,
      totalYouthEmployed,
      owner: {
        nationalId,
        firstName,
        lastName,
        phoneNumber,
      },
      subPartners,
      smeCategory,
    });
    setIsViewModalVisible(true);
  };

  const handleCancelPreview = () => {
    setIsViewModalVisible(false);
    setPreviewData(null);
  };

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number[],
    requiredOrgType: number[]
  ) => {
    return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
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
        <h2 className="text-md lg:text-xl font-bold">Enterprises</h2>
        {!hasAccess([], [1, 2], [1]) ? (
          <button
            className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
            onClick={showEnterpriseModal}
          >
            <span className="text-md md:text-md font-bold">
              <PlusOutlined />
            </span>{" "}
            Add Enterprise
          </button>
        ) : (
          ""
        )}
      </div>
      <div className="overflow-auto">
        <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
        <Table
          columns={columns}
          dataSource={enterprise}
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
        <EditEnterpriseDrawer
          selectedRecord={selectedEnterprise}
          onClose={handleDrawerClose}
          visible={isDrawerVisible}
          onEnterpriseUpdate={handleEnterpriseUpdate}
        />
        <Modal
          title={
            <span style={{ color: "#0C743F", fontSize: "20px" }}>
              Enterprise DetailsAPPLICATION TRANSFER
            </span>
          }
          visible={isViewModalVisible}
          onCancel={handleCancelPreview}
          footer={null}
          styles={styles}
        >
          {previewData && (
            <div>
              <p>
                <strong>Name:</strong>
                {""}
                {previewData.name}
              </p>
              <p>
                <strong>Type:</strong> {getEnterpriseCategory(previewData.type)}
              </p>
              <p>
                <strong>Total Youth Employed: </strong>{" "}
                {previewData.totalYouthEmployed}
              </p>
              <p>
                <strong>YouthRefugees:</strong> {previewData.noOfYouthRefugees}
              </p>
              <p>
                <strong>Youth IDP's:</strong> {previewData.noOfYouthIDPs}
              </p>
              <p>
                <strong>Youth PLWD's:</strong> {previewData.noOfYouthPLWDs}
              </p>
              <p>
                <strong>SME Category:</strong> {""}
                {getSmeCategory(previewData.smeCategory)}
              </p>
              <p>
                <strong>Sub Partners:</strong> {previewData.subPartners}
              </p>
              <p>
                <strong>Tin Number:</strong> {previewData.tinNumber}
              </p>
              <hr className="my-2" />
              <p>
                <strong>Owner:</strong>
              </p>
              <hr className="my-2" />
              <ul>
                <li>
                  <strong>Names:</strong>{" "}
                  {previewData.owner.firstName +
                    " " +
                    previewData.owner.lastName}
                </li>
                <li>
                  <strong>NID:</strong> {previewData.owner.nationalId}
                </li>
                <li>
                  <strong>Phone Number:</strong> {previewData.owner.phoneNumber}
                </li>
              </ul>
            </div>
          )}
          <div className="flex items-center justify-center w-full">
            <button
              key="cancel"
              onClick={handleCancelPreview}
              className="w-[32%] sm:w-full text-[#FFF] bg-[#0C743F] hover:bg-[#fff] font-bold rounded-none border py-2 hover:text-[#0C743F] hover:border-[#0C743F]"
            >
              OK
            </button>
          </div>
        </Modal>
        <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
      </div>
      <EnterpriseForm
        fetchEnterprise={fetchEnterprise}
        onSuccess={() => setEnterpriseModalVisible(false)}
        isVisible={isEnterpriseModalVisible}
        onCancel={() => setEnterpriseModalVisible(false)}
      />
    </>
  );
};

export default Enterprise;
