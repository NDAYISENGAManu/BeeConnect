/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Select,
  Spin,
  Table,
  TablePaginationConfig,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import nodata from "../assets/find.svg";
import { useAuth } from "../context/AuthContext";

interface SmsAccount {
  key: string;
  date: string;
  organisationName: string;
  smsUsageType: string;
  lastSmsBought: string;
  smsBalance: number;
  status: string;
}

interface Organization {
  _id: string;
  name: string;
}

const SmsAccounts: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [smsAccounts, setSmsAccounts] = useState<SmsAccount[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>(undefined);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectError, setSelectError] = useState<boolean>(false);
  const { policies, role, organizationType } = useAuth();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/organization`, {
        headers: { "x-auth-token": token },
      });
      const orgData: Organization[] = response.data.data.map((org: any) => ({
        _id: org._id,
        name: org.name,
      }));

      if (response.data.status === 200) {
        setOrganizations(orgData);
      }
    } catch (error) {
      // console.error("Error fetching organizations:", error);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;
    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
      fetchSmsAccounts();
    }
  };

  useEffect(() => {
    fetchSmsAccounts();
  }, []);

  const fetchSmsAccounts = async () => {
    setLoading(true);
    try {
      const params = selectedOrg ? { org_id: selectedOrg } : {};

      const response = await axios.get(`${baseUrl}/api/v1/sms-accounts`, {
        headers: { "x-auth-token": token },
        params,
      });

      const accountData: SmsAccount[] = response.data.data.data.map(
        (account: any) => ({
          key: account._id,
          date: new Date(account.created_at).toLocaleDateString(),
          organisationName: account.org_id?.name,
          smsUsageType: account.usageType,
          lastSmsBought: new Date(account.updatedAt).toLocaleDateString(),
          smsBalance: account.balance,
          status:
            account.approvalStatus === 3
              ? "Approved"
              : account.approvalStatus === 2
              ? "Pending"
              : "Rejected",
        })
      );

      setSmsAccounts(accountData);
      setTotalItems(response.data.data.meta.total);
      setResponseStatus(response.status);
    } catch (error: any) {
      // console.error("Error fetching SMS accounts:", error);

      if (error.response) {
        const status = error.response.status;
        setResponseStatus(status);

        if (status === 404) {
          setSmsAccounts([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(currentPage);
    fetchSmsAccounts();
  };

  const handleCreateAccount = async () => {
    if (!selectedOrg) {
      setSelectError(true);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/sms-accounts`,
        { org_id: selectedOrg },
        { headers: { "x-auth-token": token } }
      );

      if ([200, 201, 204].includes(response.status)) {
        setStatusCode(response.status);
        setStatusMessage("SMS account created successfully!");
        setIsModalVisible(false);
        fetchSmsAccounts();
      } else {
        setStatusCode(500);
        setStatusMessage("Failed to create SMS account.");
      }
      setStatusModalVisible(true);
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

  const handleSelectChange = (value: string) => {
    setSelectedOrg(value);
    setSelectError(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    fetchOrganizations();
    fetchSmsAccounts();
  }, []);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Organisation Name",
      dataIndex: "organisationName",
      key: "organisationName",
    },
    { title: "SMS Usage Type", dataIndex: "smsUsageType", key: "smsUsageType" },
    {
      title: "Last SMS Bought",
      dataIndex: "lastSmsBought",
      key: "lastSmsBought",
    },
    { title: "SMS Balance", dataIndex: "smsBalance", key: "smsBalance" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color;
        let borderColor;

        switch (status) {
          case "Approved":
            color = "green";
            borderColor = "green";
            break;
          case "Pending":
            color = "orange";
            borderColor = "orange";
            break;
          case "Rejected":
            color = "red";
            borderColor = "red";
            break;
          default:
            color = "black";
            borderColor = "black";
        }

        return (
          <span
            style={{
              color,
              border: `1px solid ${borderColor}`,
              padding: "2px 4px",
              borderRadius: "0px",
              display: "inline-block",
            }}
          >
            {status}
          </span>
        );
      },
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

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number,
    requiredOrgType: number
  ) => {
    return (
      (requiredPolicies.length === 0 ||
        requiredPolicies.some((policy) => policies?.includes(policy))) &&
      (requiredRole === null || role === requiredRole) &&
      (requiredOrgType === null || organizationType === requiredOrgType)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-0">
        <h2 className="text-xl font-bold mb-0">
          <span>SMS Accounts</span>
        </h2>
      </div>
      {hasAccess([], 1 || 2, 1) && (
        <div className="flex flex-col md:flex-row md:gap-4 gap-2 bg-[#E8E8E8] p-3">
          <div className="flex flex-col w-full md:w-[25%]">
            <Select
              placeholder="Select Organisation"
              value={selectedOrg}
              onChange={handleSelectChange}
              className="border border-gray-500 h-10 rounded-none w-full bg-white"
            >
              <Select.Option value="">All Organisations</Select.Option>
              {organizations.map((org) => (
                <Select.Option key={org._id} value={org._id}>
                  {org.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col w-full md:w-[25%]">{/* */}</div>
          <div className="flex flex-col w-full md:w-[25%]">
            <button
              onClick={handleFilter}
              className="bg-green-800 text-white font-semibold py-2 h-10 rounded-none"
            >
              Filter
            </button>
          </div>
          <div className="flex flex-col w-full md:w-[25%]">
            <button
              className="bg-green-800 text-white font-semibold py-2 h-10 rounded-none"
              onClick={showModal}
            >
              <PlusCircleOutlined /> Create account
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin
            className="ml-5"
            indicator={
              <LoadingOutlined spin className=" text-[#000] font-extrabold" />
            }
          />
        </div>
      ) : smsAccounts.length > 0 ? (
        <>
          <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
          <Table
            columns={columns}
            dataSource={smsAccounts}
            scroll={{ x: "max-content" }}
            loading={loading}
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
          <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
        </>
      ) : responseStatus === 404 ? (
        <div className="flex items-center justify-center select-none">
          <div className="w-full max-w-md text-center">
            <img
              src={nodata}
              alt="No Data"
              className="pointer-events-none select-none"
              draggable="false"
            />
            <h1 className="text-3xl font-bold text-gray-800">
              Sms Accounts Not Found.
            </h1>
            <p className="text-black text-sm font-normal">
              Please apply a filter to see results.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center select-none">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              No Sms Accounts Available.
            </h1>
          </div>
        </div>
      )}

      <Modal
        visible={isModalVisible}
        onCancel={handleCancel}
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Create SMS Account
          </span>
        }
        styles={styles}
        footer={null}
        closeIcon={null}
      >
        <h2>Choose the organization:</h2>
        <Select
          placeholder="Select Organisation"
          style={{ width: "100%" }}
          onChange={handleSelectChange}
          // className="border-1 border-[#0C743F] border rounded-md"
          className="border-gray-500 w-full h-10 rounded-none border focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
        >
          {organizations.map((org) => (
            <Select.Option key={org._id} value={org._id}>
              {org.name}
            </Select.Option>
          ))}
        </Select>
        {selectError && (
          <span className="text-red-500">Please select an organization.</span>
        )}
        <div className="flex">
          <button
            type="submit"
            onClick={handleCreateAccount}
            className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
          >
            Confirm sms account
          </button>
        </div>
      </Modal>

      <Modal
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
        closeIcon={null}
        styles={styles}
      >
        <div className="flex flex-col items-center text-center">
          {statusCode === 200 || statusCode === 201 || statusCode === 204 ? (
            <>
              <img src={success} alt="Success" className="w-16 h-16" />
              <h2 className="text-[#0C743F] text-lg font-semibold mt-4">
                {statusMessage}
              </h2>
              <div className="flex items-center justify-center my-5">
                <Button
                  key="Ok"
                  onClick={() => setStatusModalVisible(false)}
                  className="lg:w-[32%] sm:w-full p-5 text-[#0C743F]font-bold rounded-none"
                >
                  OK
                </Button>
              </div>
            </>
          ) : (
            <>
              <img src={icoerror} alt="Error" className="w-16 h-16" />
              <h2 className="text-red-600 text-lg font-semibold mt-4">
                {statusMessage}
              </h2>
              <div className="flex items-center justify-center my-5">
                <Button
                  key="Ok"
                  onClick={() => setStatusModalVisible(false)}
                  className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
                >
                  OK
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SmsAccounts;
