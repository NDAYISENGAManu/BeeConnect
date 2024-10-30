/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import upload from "../assets/upload.svg";
import {
  DownloadOutlined,
  CloudDownloadOutlined,
  LoadingOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  EyeFilled,
} from "@ant-design/icons";
import axios from "axios";
import { Input, Form, Button, Modal, Table, Spin, Tooltip, Space } from "antd";
import { formatPhone } from "../helper/validation.heper";
import Papa, { ParseResult } from "papaparse";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { useAuth } from "../context/AuthContext";
import { TablePaginationConfig } from "antd/es/table";
import nodata from "../assets/nodata.svg";

const validatePhoneNumber = (phoneNumber: string) => {
  const formattedPhone = formatPhone(phoneNumber);
  return formattedPhone ? formattedPhone : null;
};

const SendSms: React.FC = () => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [validPhones, setValidPhones] = useState<string[]>([]);
  const [invalidPhones, setInvalidPhones] = useState<string[]>([]);
  const [smsContent, setSmsContent] = useState("");
  const [description, setDescription] = useState("");
  const [base64File, setBase64File] = useState<string | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [numbersModalVisible, setNumbersModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [smsData, setSmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [smsType, setSmsType] = useState<number>(2);
  const [, setMissingNationalIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const { organizationId, organizationType } = useAuth();
  const orgId = organizationId;

  const handleSmsTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSmsType(Number(event.target.value));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      const allowedTypes = ["text/csv"];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Invalid file type. Please upload a CSV file.");
        setStatusCode(400);
        setStatusModalVisible(true);
        return;
      }

      setUploadedFileName(file.name);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64File = reader.result as string;
        setBase64File(base64File);

        Papa.parse(file, {
          header: true,
          complete: (results: ParseResult<any>) => {
            const validNumbers: string[] = [];
            const invalidNumbers: string[] = [];
            const missingNationalIdRows: string[] = [];
            const invalidNationalIds: string[] = [];

            results.data.forEach((row: any) => {
              const phoneNumber = row.phone_number?.trim();
              const nationalId = row.nationalId?.trim();

              if (!phoneNumber && !nationalId) return;

              const validatedPhone = validatePhoneNumber(phoneNumber);

              if (validatedPhone) {
                validNumbers.push(validatedPhone);
              } else {
                invalidNumbers.push(phoneNumber);
              }

              if (smsType === 1) {
                if (!nationalId || nationalId === "") {
                  missingNationalIdRows.push(phoneNumber);
                } else if (
                  nationalId.length !== 16 ||
                  !/^\d+$/.test(nationalId)
                ) {
                  invalidNationalIds.push(phoneNumber);
                }
              }
            });

            setValidPhones(validNumbers);
            setInvalidPhones(invalidNumbers);
            setMissingNationalIds(missingNationalIdRows);
            setNumbersModalVisible(true);

            if (smsType === 1) {
              if (missingNationalIdRows.length > 0) {
                setErrorMessage(
                  `The following rows are missing national IDs: ${missingNationalIdRows.join(
                    ", "
                  )}.`
                );
                setStatusModalVisible(true);
              } else if (invalidNationalIds.length > 0) {
                setErrorMessage(
                  `The following rows have invalid national IDs (must be 16 digits): ${invalidNationalIds.join(
                    ", "
                  )}.`
                );
                setStatusModalVisible(true);
              } else {
                setErrorMessage(null);
              }
            } else {
              setErrorMessage(null);
            }
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setBase64File(null);
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleProceedClick = () => {
    setShowForm(true);
    setNumbersModalVisible(false);
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

  // Calculate the SMS count based on content length
  const calculateSmsCount = () => {
    const smsLength = smsContent.length;
    return Math.ceil(smsLength / 160);
  };

  // Calculate the total cost of SMS
  const totalSmsCount = calculateSmsCount();
  const totalSmsCost = totalSmsCount * validPhones.length;

  // Check if balance is sufficient
  const isBalanceSufficient = balance !== null && balance >= totalSmsCost;

  const handleSubmit = async () => {
    if (!isBalanceSufficient) {
      setErrorMessage("Insufficient balance to send SMS.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/sms`,
        {
          file: base64File,
          message: smsContent,
          smsDescription: description,
          smsType: smsType,
        },
        {
          headers: { "x-auth-token": token },
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatusCode(response.status);
      setStatusMessage("SMS sent successfully.");
      setStatusModalVisible(true);

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        setShowForm(false);
        fetchSmsSentData();
      } else {
        setStatusMessage("There was an error sending the SMS.");
      }
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
      setStatusModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    setStatusModalVisible(false);
    setErrorMessage(null);
  };

  const handleModalCancel = () => {
    setNumbersModalVisible(false);
    setUploadedFileName(null);
    setSmsData([]);
    setShowForm(false);
    setStatusModalVisible(false);
    setErrorMessage(null);
  };

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    label: {
      color: "#0C743F",
      fontWeight: "bold",
    },
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
  }, [orgId]);

  const fetchSmsSentData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/sms-sent`, {
        params: { orgId },
        headers: { "x-auth-token": token },
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSmsData(response.data.data.data);
      setTotalItems(response.data.data.meta.total);
    } catch (error) {
      // console.error("Error fetching SMS data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredInvalidPhones = invalidPhones.filter(
    (phone) => phone.trim() !== ""
  );

  useEffect(() => {
    if (organizationType === 1) {
      setSmsType(1);
    } else {
      setSmsType(2);
    }
  }, [organizationType]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-0">
        <h2 className="text-xl font-bold mb-0">
          <span>Send SMS </span>
        </h2>
      </div>
      {organizationType === 1 && (
        <div className="flex items-center justify-start mb-0 gap-2 text-gray-600">
          <label>
            <input
              type="radio"
              value="1"
              name="smsType"
              checked={smsType === 1}
              onChange={handleSmsTypeChange}
            />
            <span className="ml-2">Mobilization</span>
          </label>
          <br />
          <label>
            <input
              type="radio"
              value="2"
              name="smsType"
              checked={smsType === 2}
              onChange={handleSmsTypeChange}
            />
            <span className="ml-2">Other</span>
          </label>
        </div>
      )}
      <>
        <div className="flex flex-col md:flex-row gap-4 upload-recipient">
          <div className="flex items-center justify-center w-full md:w-1/2 border-2 border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100 rounded-md">
            <a
              href="/SMS_Receivers_template.csv"
              download="SMS_Receivers_template.csv"
              className="flex flex-col items-center justify-center w-full h-64 cursor-pointer"
            >
              <DownloadOutlined className="w-10 h-10" />
              <span className="text-sm font-semibold">
                Download sms recipient Template
              </span>
            </a>
          </div>
          <div className="flex items-center justify-center w-full md:w-1/2">
            <Tooltip
              title={!balance ? "You have no balance to send SMS" : ""}
              visible={!balance}
              className={!balance ? "bg-red-50" : ""}
            >
              <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 ${
                  !balance
                    ? "border-red-500 cursor-not-allowed"
                    : "border-gray-300 cursor-pointer"
                } border-dashed rounded-lg bg-gray-50 hover:bg-gray-100`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <img src={upload} alt="" className="w-5 h-5 my-1" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">
                      {uploadedFileName
                        ? `Uploaded: ${uploadedFileName}`
                        : "Click to browse and upload sms recipients"}
                    </span>{" "}
                  </p>
                  <p className="text-xs text-gray-500">CSV Format</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  disabled={!balance}
                  onChange={handleFileUpload}
                />
              </label>
            </Tooltip>
          </div>
        </div>
        {uploadedFileName ? (
          <div className="flex items-center justify-end py-2">
            {uploadedFileName} -{" "}
            <CloseOutlined
              onClick={handleRemoveFile}
              style={{ cursor: "pointer", marginLeft: 8 }}
              className="bg-red-100 text-red-600"
            />
          </div>
        ) : (
          <div className="flex items-center justify-end">No file selected</div>
        )}
      </>
      {showForm ? (
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            smsContent: "",
            description: "",
          }}
          className="text-left"
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter a description",
              },
            ]}
          >
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
            />
          </Form.Item>
          <Form.Item
            label="SMS Content"
            name="smsContent"
            rules={[
              {
                required: true,
                message: "Please enter the SMS content",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              value={smsContent}
              onChange={(e) => {
                setSmsContent(e.target.value);
              }}
              className="rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
            />
          </Form.Item>

          <div className=" flex mt-2 mb-0 px-3 pt-3 bg-gray-100 rounded-md gap-2">
            <p>
              <strong>Words:</strong> ({smsContent.length})
            </p>
            <p>
              <strong>Total SMS:</strong> ({calculateSmsCount()})
            </p>
            <p>
              <strong>Total Receivers:</strong>({validPhones.length})
            </p>

            {!isBalanceSufficient && (
              <p className="text-red-600 my-0">
                You have exceeded the sms balance, Please purchase more and try
                again
              </p>
            )}
          </div>
          <Form.Item>
            <div className="flex items-center justify-start w-full">
              <Button
                htmlType="submit"
                loading={loading}
                disabled={!isBalanceSufficient}
                className="w-full lg:w-[30%] p-2 my-2 rounded-none transition-colors font-bold bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F]"
              >
                Send SMS
              </Button>
            </div>
          </Form.Item>
        </Form>
      ) : (
        <>
          <div className="flex items-center justify-between mt-4">
            <h2 className="text-xl font-bold">SMS Sent</h2>
          </div>
          <div className="bg-[#F6F6F6] h-10">&nbsp;</div>
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
                  itemRender: (page, type, originalElement) => {
                    if (type === "page") {
                      return (
                        <a
                          className="p-0 border-none"
                          style={{
                            color: page === currentPage ? "white" : "#fff",
                            background:
                              page === currentPage ? "#000" : "#9c9c9c",
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
                        <strong>SMS Content:</strong>{" "}
                        {selectedRecord.smsContent}
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
                        <strong>Failed SMS:</strong>{" "}
                        {selectedRecord.failedCount}
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
      )}
      <Modal
        open={numbersModalVisible}
        onCancel={() => setNumbersModalVisible(false)}
        footer={null}
        styles={styles}
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Phone Numbers Validation
          </span>
        }
        width={1000}
      >
        {balance !== null && validPhones.length > balance ? (
          <div className="flex flex-col items-center my-8">
            {/* <img src={icoerror} alt="error" className="w-15 h-15 mb-4" /> */}
            <p className="text-lg text-black-600 text-center">
              {" "}
              <span className="bg-gray-200 px-3 py-3 mx-3">
                {/* <ExclamationOutlined /> */}
                <ExclamationCircleOutlined />
              </span>
              You only have {balance} SMS balance, but there are{" "}
              {validPhones.length} valid phone numbers. Please reduce the number
              of valid phones recipients or buy more SMS balance.
            </p>
          </div>
        ) : filteredInvalidPhones.length === 0 ? (
          <div className="flex flex-col items-center my-8">
            <p className="text-lg flex text-center">
              <img
                src={success}
                alt="success"
                className="w-5 h-5 mb-4 flex items-center mr-2 mt-1"
              />
              <span>All phone numbers are valid!</span>
            </p>
            <p className="text-md text-green-600 mt-0 font-bold">
              Total valid numbers: {validPhones.length}
            </p>
          </div>
        ) : (
          <div className="my-2">
            <p className="text-md font-bold mb-4">
              The following phone numbers are invalid, They will not receive
              SMS, click to confirm or cancel:
            </p>
            <div className="flex flex-wrap">
              {filteredInvalidPhones.map((phone, index) => (
                <span key={index} className="mr-1 text-red-500 bg-red-50 px-2">
                  {phone}
                  {index < filteredInvalidPhones.length - 1 && ","}
                </span>
              ))}
            </div>
            <p className="text-md text-green-600 mt-3 font-bold">
              Valid numbers: ({validPhones.length})
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            key="cancel"
            onClick={() => setNumbersModalVisible(false)}
            className="lg:w-[32%] sm:w-full p-2 text-[#757575] font-bold rounded-none border"
          >
            {balance !== null && validPhones.length > balance ? "Ok" : "Cancel"}
          </button>
          <Button
            key="ok"
            onClick={handleProceedClick}
            className="lg:w-[32%] sm:w-full bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border rounded-none hover:border-[#0C743F] transition-colors transform-cpu py-2 px-10 font-bold"
            disabled={balance !== null && validPhones.length > balance}
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
        open={statusModalVisible}
        // onCancel={handleModalCancel}
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
              <span className="text-lg text-[#FF0000]">
                {errorMessage || statusMessage}
              </span>
            </div>
            <div className="flex items-center justify-center my-5">
              <Button
                key="Ok"
                onClick={handleModalCancel}
                className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SendSms;
