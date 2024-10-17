/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  CloudDownloadOutlined,
  LoadingOutlined,
  EyeFilled,
  FilterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Modal, Table, Spin, Tooltip, Space, DatePicker } from "antd";
import { useAuth } from "../context/AuthContext";
import { TablePaginationConfig } from "antd/es/table";
import nodata from "../assets/nodata.svg";
import { checkHasPolicy } from "../helper/app.helper";
import moment from "moment";
export interface Organization {
  _id: string;
  name: string;
}

const { RangePicker } = DatePicker;

const CommunicationsReport: React.FC = () => {
  const [smsData, setSmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalUnReachable, setTotalUnReachable] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [statsData, setStatsData] = useState([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filters, setFilters] = useState({ orgId: "", from: "", to: "" });
  const [isError, setIsError] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const { organizationId } = useAuth();
  const orgId = organizationId || filters.orgId;

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    label: {
      color: "#0C743F",
      fontWeight: "bold",
    },
  };

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/organization`, {
        headers: { "x-auth-token": token },
      });
      setOrganizations(response.data.data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateChange = (_dates: any, dateStrings: [string, string]) => {
    setFilters({
      ...filters,
      from: dateStrings[0] ? moment(dateStrings[0]).format("YYYY-MM-DD") : "",
      to: dateStrings[1] ? moment(dateStrings[1]).format("YYYY-MM-DD") : "",
    });
  };

  const handleFilterButtonClick = () => {
    fetchSmsSentData();
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
      fetchSmsSentData();
    }
  };

  useEffect(() => {
    fetchSmsSentData();
    fetchSmsStatsData();
    fetchOrganizations();
  }, [orgId]);

  const fetchSmsSentData = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (filters.orgId || orgId) {
        params.orgId = filters.orgId || orgId;
      }
      if (filters.from) {
        params.from = filters.from;
      }
      if (filters.to) {
        params.to = filters.to;
      }

      const response = await axios.get(`${baseUrl}/api/v1/sms-sent`, {
        params,
        headers: { "x-auth-token": token },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSmsData(response.data.data.data);
      setTotalItems(response.data.data.meta.total);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsStatsData = async () => {
    try {
      const params: any = {};

      if (filters.orgId || orgId) {
        params.orgId = filters.orgId || orgId;
      }
      if (filters.from) {
        params.from = filters.from;
      }
      if (filters.to) {
        params.to = filters.to;
      }

      const response = await axios.get(
        `${baseUrl}/api/v1/sms-sent/statistics`,
        {
          params,
          headers: { "x-auth-token": token },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatsData(response.data.data);
    } catch (error) {
      console.error("Error fetching SMS stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statsData.length > 0) {
      const stats: any = statsData[0];
      setTotalDelivered(stats.totalDelivered || 0);
      setTotalFailed(stats.totalFailed || 0);
      setTotalPending(stats.totalPending || 0);
      setTotalUnReachable(stats.totalUnReachable || 0);
      setTotalRejected(stats.totalRejected || 0);
    }
  }, [statsData]);

  const handleViewMore = (record: any) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Batch Number",
      dataIndex: "batchNumber",
      key: "batchNumber",
      render: (text: string) => (
        <div>{text ? `BATCH#${text.slice(0, 3).toUpperCase()}` : "-"}</div>
      ),
    },
    {
      title: "SMS Content",
      dataIndex: "smsContent",
      key: "smsContent",
      render: (text: string) => (
        <div
          style={{
            width: "150px",
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
      title: "Number of Recipients",
      dataIndex: "numberOfRecipients",
      key: "numberOfRecipients",
      render: (text: string) => (
        <div
          style={{
            width: "100px",
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
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: "Delivered",
      dataIndex: "deliveredCOunt",
      key: "deliveredCOunt",
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: "Sender",
      dataIndex: ["sender", "name"],
      key: "senderName",
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: "Date Sent",
      dataIndex: ["sender", "when"],
      key: "dateSent",
      render: (text: string) => <div>{new Date(text).toLocaleString()}</div>,
    },
    {
      title: "Description",
      dataIndex: "smsDescription",
      key: "smsDescription",
      render: (text: string) => (
        <div
          style={{
            width: "150px",
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
      title: "Action",
      dataIndex: "csvFilePath",
      key: "csvFilePath",
      render: (csvFilePath: string, record: any) => (
        <Space size="middle" className="gap-1">
          <Tooltip title={!csvFilePath ? "File not available" : ""}>
            <CloudDownloadOutlined
              className="border px-1"
              style={{ fontSize: "20px", color: "#0C743F" }}
              onClick={() => csvFilePath && window.open(csvFilePath, "_blank")}
              disabled={!csvFilePath}
            />
          </Tooltip>
          <EyeFilled
            style={{ fontSize: "20px", color: "#0C743F" }}
            onClick={() => handleViewMore(record)}
            className="border px-1"
          />
        </Space>
      ),
    },
  ];

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number[],
    requiredOrgType: number[]
  ) => {
    return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[#0C743F] text-2xl font-bold leading-[28.13px] text-left">
          <span>Communications Report</span>
        </h2>
      </div>
      {hasAccess([], [1, 2], [1]) && (
        <div className="flex items-center justify-between bg-[#E8E8E8] p-2 mb-4">
          <div className="flex items-center justify-between space-x-2 w-full">
            <select
              name="orgId"
              value={filters.orgId}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
            >
              <option value="">All Partners</option>
              {organizations.map((organization) => (
                <option key={organization._id} value={organization._id}>
                  {organization.name}
                </option>
              ))}
            </select>
            <RangePicker
              onChange={handleDateChange}
              className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-2/4"
            />
            <button
              onClick={handleFilterButtonClick}
              className="bg-[#0C743F] text-sm text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu flex items-center justify-center rounded-none w-[32%] h-10 px-2 py-2 m-2"
            >
              <span className="mr-1">
                <FilterOutlined />
              </span>
              Filter
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:grid sm:grid-cols-5 gap-4">
        <div className="flex flex-col justify-center bg-gray-300 h-20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-[#000] font-extrabold"
                  />
                }
              />
            </div>
          ) : smsData.length > 0 ? (
            <>
              <h1 className="text-[#0C743F] text-1xl font-bold mt-1">
                Total Delivered
              </h1>
              <p className="text-[#000000] text-1xl font-bold">
                {totalDelivered}
              </p>
            </>
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-col justify-center bg-gray-300 h-20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-[#000] font-extrabold"
                  />
                }
              />
            </div>
          ) : smsData.length > 0 ? (
            <>
              <h1 className="text-[#0C743F] text-1xl font-bold mt-1">
                Total Pending
              </h1>
              <p className="text-[#000000] text-1xl font-bold">
                {totalPending}
              </p>
            </>
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-col justify-center bg-gray-300 h-20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-[#000] font-extrabold"
                  />
                }
              />
            </div>
          ) : smsData.length > 0 ? (
            <>
              <h1 className="text-[#0C743F] text-1xl font-bold mt-1">
                Total Unreachable
              </h1>
              <p className="text-[#000000] text-1xl font-bold">
                {totalUnReachable}
              </p>
            </>
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-col justify-center bg-gray-300 h-20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-[#000] font-extrabold"
                  />
                }
              />
            </div>
          ) : smsData.length > 0 ? (
            <>
              <h1 className="text-[#0C743F] text-1xl font-bold mt-1">
                Total Failed
              </h1>
              <p className="text-[#000000] text-1xl font-bold">{totalFailed}</p>
            </>
          ) : (
            ""
          )}
        </div>
        <div className="flex flex-col justify-center bg-gray-300 h-20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-[#000] font-extrabold"
                  />
                }
              />
            </div>
          ) : smsData.length > 0 ? (
            <>
              <h1 className="text-[#0C743F] text-1xl font-bold mt-1">
                Total Rejected
              </h1>
              <p className="text-[#000000] text-1xl font-bold">
                {totalRejected}
              </p>
            </>
          ) : (
            ""
          )}
        </div>
      </div>

      <>
        <div className="bg-[#F6F6F6] h-10">&nbsp;</div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin
              className="ml-5"
              indicator={
                <LoadingOutlined spin className=" text-[#000] font-extrabold" />
              }
            />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center select-none">
            <div className="w-full max-w-md text-center">
              <img
                src={nodata}
                alt="No Data"
                className="pointer-events-none select-none"
                draggable="false"
              />
              <h1 className="text-xl font-bold text-gray-800">
                SMS Sent Not Found.
              </h1>
              <p className="text-black text-sm font-normal">
                Please send sms to see results.
              </p>
            </div>
          </div>
        ) : smsData.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={smsData}
              // rowKey="_id"
              loading={loading}
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
              rowKey={(record: any) => record.id}
            />
            <Modal
              title={
                <span style={{ color: "#0C743F", fontSize: "20px" }}>
                  SMS Details
                </span>
              }
              open={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={null}
              styles={styles}
            >
              {selectedRecord && (
                <>
                  <div>
                    <p>
                      <strong>Batch Number:</strong>{" "}
                      {selectedRecord.batchNumber}
                    </p>
                    <p>
                      <strong>Sender:</strong> {selectedRecord.sender?.name}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedRecord.smsDescription}
                    </p>

                    <p>
                      <strong>SMS Content:</strong> {selectedRecord.smsContent}
                    </p>
                    <p>
                      <strong>Number of Recipients:</strong>{" "}
                      {selectedRecord.numberOfRecipients}
                    </p>
                    <p>
                      <strong>Cost:</strong> {selectedRecord.cost}
                    </p>
                    <p>
                      <strong>Derivered SMS:</strong>{" "}
                      {selectedRecord.deliveredCOunt}
                    </p>
                    <p>
                      <strong>Failed SMS:</strong> {selectedRecord.failedCount}
                    </p>
                    <p>
                      <strong>Pending SMS:</strong>{" "}
                      {selectedRecord.pendingCount}
                    </p>
                    <p>
                      <strong>Rejected SMS:</strong>{" "}
                      {selectedRecord.rejectedCount}
                    </p>
                    <p>
                      <strong>Unreachable SMS:</strong>{" "}
                      {selectedRecord.unreachableCount}
                    </p>
                    <p>
                      <strong>Date Sent:</strong>{" "}
                      {new Date(selectedRecord.sender?.when).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-center my-5">
                    <button
                      key="close"
                      onClick={() => setIsModalVisible(false)}
                      className="lg:w-[32%] sm:w-full bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </Modal>
          </>
        ) : (
          <div className="flex items-center justify-center select-none">
            <div className="w-full max-w-md text-center">
              <img
                src={nodata}
                alt="No Data"
                className="pointer-events-none select-none"
                draggable="false"
              />
              <h1 className="text-xl font-bold text-gray-800">
                SMS Sent Not Found.
              </h1>
              <p className="text-black text-sm font-normal">
                Please send sms to see results.
              </p>
            </div>
          </div>
        )}
        <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
      </>
    </div>
  );
};

export default CommunicationsReport;
