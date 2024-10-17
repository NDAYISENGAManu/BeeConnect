/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Button, message, Spin, Modal, Tooltip } from "antd";
import { CloudDownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import pending from "../assets/pending.svg";
import paid from "../assets/paid.svg";
import nodata from "../assets/nodata.svg";
import { useAuth } from "../context/AuthContext";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";

interface Communication {
  key: string;
  date: string;
  farmerName: string;
  FarmerContacts: string;
  FarmerLocation: string;
  EducationLevel: string;
  CommunicationRequested: string;
  status: string;
}

const Purchase: React.FC = () => {
  const [credits, setCredits] = useState("");
  const [email, setEmail] = useState("");
  const [creditsError, setCreditsError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [data, setData] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const { organizationId } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [totalPaidSms, setTotalPaidSms] = useState<number | null>(null);
  const [totalNotPaidSms, setTotalNotPaidSms] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const { organizationType } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/api/v1/sms-purchases`;
      if (organizationType === 1) {
        url += `?orgId=${organizationId}`;
      }

      const response = await axios.get(url, {
        headers: { "x-auth-token": token },
      });

      const fetchedData = response.data.data.map(
        (item: any, index: number) => ({
          key: index.toString(),
          ext_sender_id: item.ext_sender_id,
          client: item.client,
          billNo: item.billNo,
          requested_sms: item.requested_sms,
          approved_sms: item.approved_sms,
          rate: item.rate,
          paid: item.paid,
          approved: item.approved,
          currency: item.currency,
          invoice: item.invoice,
          createdAt: new Date(item.createdAt).toLocaleDateString(),
        })
      );

      let totalPaidSms = 0;
      let totalNotPaidSms = 0;

      fetchedData.forEach((item: any) => {
        if (item.paid) {
          totalPaidSms += item.requested_sms;
        } else {
          totalNotPaidSms += item.requested_sms;
        }
      });

      setTimeout(() => {
        setTotalNotPaidSms(totalNotPaidSms);
        setTotalPaidSms(totalPaidSms);
        setData(fetchedData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.log("Failed to fetch SMS purchase requests.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl, organizationId, organizationType, token]);

  const handleSubmit = async () => {
    if (!validateCredits() || !validateEmail()) {
      message.error("Please fill in all required fields correctly.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/sms-purchases`,
        {
          credits: parseInt(credits, 10),
          email,
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      setStatusCode(response.status);
      if (response.status === 200 || response.status === 201) {
        setStatusMessage("SMS purchase request submitted successfully.");
        setCredits("");
        setEmail("");
        fetchBalance();
        fetchData();
      }
      setIsSuccessModalVisible(true);
    } catch (error: any) {
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
      setIsSuccessModalVisible(true);
    }
  };

  const fetchBalance = async () => {
    try {
      let url = `${baseUrl}/api/v1/sms-purchases/balance`;
      if (organizationType === 1) {
        url += `?orgId=${organizationId}`;
      }

      const response = await axios.get(url, {
        headers: { "x-auth-token": token },
      });

      setBalance(response.data.data.balance);
    } catch (error) {
      console.log("An error occurred while fetching SMS balance.");
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const validateCredits = () => {
    if (!credits) {
      setCreditsError("Please enter the quantity of SMS needed.");
      return false;
    }
    if (isNaN(Number(credits)) || Number(credits) <= 0) {
      setCreditsError("Please enter a valid number.");
      return false;
    }
    setCreditsError("");
    return true;
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError("Please enter an email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const columns = [
    {
      title: "External Sender ID",
      dataIndex: "ext_sender_id",
      key: "ext_sender_id",
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
    },
    {
      title: "Bill No",
      dataIndex: "billNo",
      key: "billNo",
    },
    {
      title: "Requested SMS",
      dataIndex: "requested_sms",
      key: "requested_sms",
    },
    {
      title: "Approved SMS",
      dataIndex: "approved_sms",
      key: "approved_sms",
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Status",
      dataIndex: "paid",
      key: "paid",
      render: (paid: boolean) => (
        <span
          style={{
            color: paid ? "green" : "orange",
            border: `1px solid ${paid ? "green" : "orange"}`,
            padding: "2px 6px",
            borderRadius: "0px",
          }}
        >
          {paid ? "Paid" : "Pending"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (invoice: string) => (
        <Tooltip title={!invoice ? "File not available" : ""}>
          <CloudDownloadOutlined
            className="border px-1"
            style={{ fontSize: "20px", color: "#0C743F" }}
            onClick={() => invoice && window.open(invoice, "_blank")}
            disabled={!invoice}
          />
        </Tooltip>
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
        <h2 className="text-xl font-bold">
          <span>Communication</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 w-full">
        <div className="flex flex-col bg-[#0C743F] p-3 rounded-none items-end w-full">
          <h2 className="text-white text-lg font-bold">REMAINING SMS</h2>
          <p className="text-3xl text-white font-extrabold">{balance}</p>
        </div>

        <div className="flex flex-col justify-normal bg-[#ECF4F0] p-3 w-full rounded-none">
          <h2 className="text-[#0C743F] text-lg font-bold mr-0 flex items-end justify-end">
            SMS REQUEST STATUS
          </h2>
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <div className="flex flex-col w-full items-center pt-2 border-2 border-yellow-200 bg-white rounded-none">
              <img src={pending} alt="" className="w-10 h-10 my-1" />
              <h2 className="text-yellow-500 text-md font-bold">PENDING</h2>
              <p className="text-lg font-extrabold">{totalNotPaidSms}</p>
            </div>
            <div className="flex flex-col w-full items-center pt-2 border-2 border-[#00940F]-100 bg-white rounded-none">
              <img src={paid} alt="" className="w-10 h-10 my-1" />
              <h2 className="text-[#0C743F] text-md font-bold">PAID</h2>
              <p className="text-lg font-extrabold">{totalPaidSms}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-normal bg-gray-100 p-3 w-full rounded-none md:col-span-2 lg:col-span-1">
          <h2 className="text-gray-500 text-lg font-bold mr-0 flex items-end justify-start">
            REQUEST SMS
          </h2>
          <div className="flex gap-2">
            <div className="flex flex-col w-full items-start p-2">
              <h2>
                <span className="text-red-500">*</span> Quantity of Sms needed
              </h2>
              <input
                placeholder="000"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                onBlur={validateCredits}
                className="border border-gray-300 rounded-none p-2 focus:outline-none focus:ring-1 focus:ring-[#0C743F]-500 w-full"
              />
              {creditsError && (
                <span className="text-red-500 text-sm">{creditsError}</span>
              )}
            </div>
            <div className="flex flex-col w-full items-start pt-2">
              <h2 className="">
                <span className="text-red-500">*</span> Email address for
                invoice
              </h2>
              <input
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                className="border border-gray-300 rounded-none p-2 focus:outline-none focus:ring-1 focus:ring-[#0C743F]-500 w-full"
              />
              {emailError && (
                <span className="text-red-500 text-sm">{emailError}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end pt-2 w-full">
            <button
              onClick={handleSubmit}
              className="bg-[#0C743F] text-white hover:text-[#0C743F] md:w-[48.5%] rounded-none py-2 hover:bg-white border hover:border-[#0C743F] transition-colors font-bold"
            >
              SUBMIT REQUEST
            </button>
          </div>
          <Modal
            visible={isSuccessModalVisible}
            onOk={() => setIsSuccessModalVisible(false)}
            styles={styles}
            footer={null}
            closeIcon={null}
          >
            {statusCode === 200 || statusCode === 201 ? (
              <>
                <div className="center-container font-bold">
                  <img src={success} alt="" className="mt-10" />
                  <span className="text-3xl my-5 text-[#0C743F]">
                    Thank you!
                  </span>
                  <span className="text-lg text-[#0C743F]">
                    {statusMessage}
                  </span>
                </div>
                <div className="flex items-center justify-center my-5">
                  <Button
                    key="Ok"
                    onClick={() => setIsSuccessModalVisible(false)}
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
                  <span className="text-lg text-[#FF0000]">
                    {statusMessage}
                  </span>
                </div>
                <div className="flex items-center justify-center my-5">
                  <Button
                    key="Ok"
                    onClick={() => setIsSuccessModalVisible(false)}
                    className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
                  >
                    OK
                  </Button>
                </div>
              </>
            )}
          </Modal>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-bold">SMS Requests</h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin
            className="ml-5"
            indicator={
              <LoadingOutlined spin className=" text-[#000] font-extrabold" />
            }
          />
        </div>
      ) : data.length > 0 ? (
        <>
          <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
          <Table
            columns={columns}
            dataSource={data}
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 15 }}
            rowKey="billNo"
          />
          <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
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
              Purchased SMS Not Found.
            </h1>
            <p className="text-black text-sm font-normal">
              Please purchace sms to see results.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Purchase;
