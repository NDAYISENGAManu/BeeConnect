/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Table, Space, Button, Spin, Modal, Select } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import Papa from "papaparse";
import {
  FilterOutlined,
  LoadingOutlined,
  PlusOutlined,
  CloseOutlined,
  EyeFilled,
  EditFilled,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { errorToastConfig } from "../reusable/data";
import nodata from "../assets/find.svg";
import { api } from "../api";
import {
  getEducationLevel,
  getEmploymentStatus,
  getBusinessType,
  getMaritalStatus,
  getSmeCategory,
  getGender,
} from "../types/utils";
import { getEmploymentType } from "../types/utils";
import { userUpload, getOrganizationById } from "../api/server";
import { userOrganizationId } from "../helper/data.helper";
import { checkHasPolicy } from "../helper/app.helper";
import SuccessModal from "./SuccessModal";
import upload from "../assets/eos-icons_csv-file.svg";
import VectorUpload from "../assets/VectorUpload.svg";
import { Farmer } from "../types/globalData";
import EditFarmerDrawer from "./EditFarmerDrawer";

export interface Organization {
  _id: string;
  name: string;
}

export interface OrganizationServices {
  _id: string;
  name: string;
}

const statusOptions = [
  { label: "Rejected", value: 1 },
  { label: "Pending", value: 2 },
  { label: "Approved", value: 3 },
];

const Farmers: React.FC = () => {
  const [data, setData] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [, setSelectedOrgId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [orginalData, setOrginalData] = useState([]);
  const [activeServices, setActiveServices] = useState<OrganizationServices[]>(
    []
  );
  const [activeService, setService] = useState<string | "">("");
  const [applicantsFilters, setFilters] = useState({});
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [applicantsCount, setApplicantsCount] = useState<number>(0);
  const [selectedServiceName, setSelectedServiceName] =
    useState<string>("None");
  const [businessType, setBusinessType] = useState<number | null>(null);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get("/api/v1/organization");
      const orgData = response.data.data.map((org: any) => ({
        _id: org._id,
        name: org.name,
      }));

      if (response.data.status === 200) {
        setOrganizations(orgData);
      }
      setOrginalData(response.data.data);
    } catch (error) {
      //
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    // Set the current page and page size
    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
    }

    // If no filters are applied, reset the filters
    if (!isFiltered) {
      setFilters({});
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [currentPage, pageSize]);

  const fetchApplicants = async () => {
    setLoading(true);
    setShowMessage(false);
    try {
      // Prepare the parameters object conditionally
      const params: any = {
        page: currentPage,
      };

      // Only include filters if they exist
      if (isFiltered) {
        Object.assign(params, applicantsFilters);
      }

      const response = await api.get("/api/v1/applicants", { params });
      const farmers = response.data.data.data;
      farmers.map((farmer: any) => {
        farmer.key = farmer._id;
        farmer.date = new Date(farmer.created_at).toLocaleDateString();
        farmer.firstName = farmer.firstName;
        farmer.lastName = farmer.lastName;
        farmer.nationalId = farmer.nationalId;
        (farmer.phoneNumber = farmer.phoneNumber),
          (farmer.userType = farmer.userType);
        farmer.educationLevel = farmer.educationLevel;
        farmer.businessType = farmer.businessType;
        farmer.employmentStatus = farmer.employmentStatus;
        farmer.employmentType = farmer.employmentType;
        farmer.location = farmer.location;
        farmer.smeCategory = farmer.smeCategory;
        farmer.dateOfBirth = new Date(farmer.dateOfBirth).toLocaleDateString();
        farmer.age = farmer.age;
        (farmer.gender = farmer.gender),
          (farmer.maritalStatus = farmer.maritalStatus);
        farmer.hasDisability = farmer.hasDisability;
        farmer.isARefugee = farmer.isARefugee;
        farmer.isActiveStudent = farmer.isActiveStudent;
        farmer.enterpriseName = farmer.enterprise ? farmer.enterprise.name : "";
      });

      if (farmers.length === 0) {
        setShowMessage(!isFiltered);
        setData([]);
      } else {
        setData(farmers);
        setShowMessage(false);
        setTotalItems(response.data.data.meta.total);
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const onSelectOrganization = (value: string) => {
    setSelectedOrgId(value);
    setActiveServices([]);
    const selectedOrganization: any = orginalData.find(
      (el: any) => el._id === value
    );
    setActiveServices(selectedOrganization.servicesProvided);
    setFilters((values) => ({
      ...values,
      orgId: value,
    }));
  };

  const getServiceName = (serviceId: string) => {
    const service = activeServices.find(
      (s: OrganizationServices) => s._id === serviceId
    );
    return service ? service.name : "None";
  };

  const onSelectService = (value: string) => {
    setService(value);
    setFilters((values) => ({
      ...values,
      serviceId: value,
    }));
    const selectedServiceName = getServiceName(value);
    setSelectedServiceName(selectedServiceName);
  };

  const selectService = (value: string) => {
    setService(value);
    const selectedServiceName = getServiceName(value);
    setSelectedServiceName(selectedServiceName);
  };

  const getUserOrganizationDetails = async () => {
    setLoading(true);
    const orgId = userOrganizationId();
    setFilters((values) => ({
      ...values,
      orgId: orgId,
    }));
    try {
      const res = await getOrganizationById(orgId);
      if (res) {
        const { servicesProvided } = res.data;
        setActiveServices(servicesProvided);
      }
    } catch (error) {
      //
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    getUserOrganizationDetails();
  }, []);

  const handleViewDetails = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedFarmer(null);
  };

  const handleFilter = () => {
    setIsFiltered(true);
    fetchApplicants();
  };

  const handleEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setFilters({});
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedFarmer(null);
  };

  const handleFarmerUpdated = () => {
    fetchApplicants();
  };

  const handleUploadApplicants = () => {
    setSelectedServiceName("None");
    setService("");
    setIsUploadModalVisible(true);
  };

  const handleUploadModalClose = () => {
    setFile(null);
    setApplicantsCount(0);
    setService("");
    setBusinessType(null);
    setIsSubmitAttempted(false);
    setSelectedServiceName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsUploadModalVisible(false);
  };

  const handleContactsFileUpload = async () => {
    setIsSubmitAttempted(true);
    if (!activeService || !businessType || !file) {
      return;
    }

    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1];
        try {
          const res = await userUpload({
            serviceId: activeService,
            file: base64String,
            businessType: businessType,
          });

          if (res) {
            setFilters({});
            handleUploadModalClose();
            setIsSuccessModalVisible(true);
            fetchApplicants();
            setIsUploadModalVisible(false);
          } else {
            toast("Failed to upload the file.", errorToastConfig);
            console.log(errorToastConfig);
          }
        } catch (error) {
          toast("Failed to upload the file.", errorToastConfig);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const errorMessage = validateFile(selectedFile);
      if (!errorMessage) {
        setFile(selectedFile);
        parseCSVFile(selectedFile);
      } else {
        toast(errorMessage, errorToastConfig);
        handleRemoveFile();
      }
    }
  };

  const parseCSVFile = (file: File) => {
    console.log("Parsing file...");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsing complete, checking results...");
        const records: any = results.data;

        if (records.length > 0) {
          const headers = Object.keys(records[0]);
          console.log("Headers:", headers);
          const newheader = headers.includes("smeCategory");
          const newbusinesstype = businessType === 1;

          if (newheader && newbusinesstype) {
            toast(
              "You selected the wrong file for the selected business type.",
              errorToastConfig
            );
            console.log("Wrong file detected, removing file...");
            handleRemoveFile();
            setIsSubmitDisabled(true);
          } else {
            setApplicantsCount(records.length);
            setIsSubmitDisabled(false);
            console.log(
              "File parsed successfully, applicants count set:",
              records.length
            );
          }
        } else {
          toast("The file is empty or invalid.", errorToastConfig);
          handleRemoveFile();
          console.log("Empty or invalid file detected, removing file...");
        }
      },
      error: () => {
        toast("Error parsing CSV file.", errorToastConfig);
        handleRemoveFile();
        console.log("Error while parsing the file, removing file...");
      },
    });
  };

  const validateFile = (file: File) => {
    const allowedType = "text/csv";
    const maxFileSize = 3 * 1024 * 1024;

    if (file.type !== allowedType) {
      return "Invalid file type. Only CSV files are allowed.";
    }

    if (file.size > maxFileSize) {
      return "File size exceeds 3 MB. Please select a smaller file.";
    }

    return null;
  };

  const handleRemoveFile = () => {
    setFile(null);
    setApplicantsCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSuccessModalClose = () => {
    setIsSuccessModalVisible(false);
  };

  const columns: ColumnsType<Farmer> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "National ID", dataIndex: "nationalId", key: "nationalId" },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Education Level",
      dataIndex: "educationLevel",
      key: "educationLevel",
      render: (educationLevel: number) => (
        <span>{getEducationLevel(educationLevel)}</span>
      ),
    },
    {
      title: "Business Type",
      dataIndex: "businessType",
      key: "businessType",
      render: (businessType: number) => (
        <span>{getBusinessType(businessType)}</span>
      ),
    },
    {
      title: "Employment Status",
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      render: (employmentStatus: number) => (
        <span>{getEmploymentStatus(employmentStatus)}</span>
      ),
    },
    {
      title: "SME Category",
      dataIndex: "smeCategory",
      key: "smeCategory",
      render: (smeCategory: number) => (
        <span>{getSmeCategory(smeCategory)}</span>
      ),
    },
    {
      title: "Marital Status",
      dataIndex: "maritalStatus",
      key: "maritalStatus",
      render: (maritalStatus: number) => (
        <span>{getMaritalStatus(maritalStatus)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle" className="gap-1">
          <Button
            className="text-[#0C743F] border-1 rounded-none"
            icon={<EyeFilled className="text-[#0C743F]" />}
            size="small"
            onClick={() => handleViewDetails(record)}
          />
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
  };

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-md lg:text-xl font-bold">
          <button className="">Applicants Profiles</button>
        </h2>
        {hasAccess([], [1, 2], [2]) && (
          <button
            onClick={handleUploadApplicants}
            className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu pt-1 pb-2 px-10 font-bold w-full sm:w-[25%]"
          >
            <span className="text-md md:text-xl font-bold">
              <PlusOutlined />
            </span>{" "}
            Upload Applicants
          </button>
        )}
      </div>
      {hasAccess([], [1, 2], [1, 2]) && (
        // <div className="flex items-center justify-between py-2 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full space-y-2 sm:space-y-0 sm:space-x-2 bg-[#E8E8E8] py-2 px-2 mb-2">
          {hasAccess([], [1, 2], [1]) && (
            <Select
              className="border-gray-300 text-[#A3A3A3] flex w-full sm:w-[25%] h-10"
              onChange={(value) => onSelectOrganization(value)}
              placeholder="Select by Partner"
              allowClear
            >
              {organizations.map((org) => (
                <Select.Option key={org._id} value={org._id}>
                  {org.name}
                </Select.Option>
              ))}
            </Select>
          )}
          <Select
            className="border-gray-300 text-[#A3A3A3] flex w-full sm:w-[25%] h-10"
            onChange={(value) => onSelectService(value)}
            placeholder="Select Services"
            allowClear
          >
            {activeServices.map((service) => (
              <Select.Option key={service._id} value={service._id}>
                {service.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            icon={<FilterOutlined />}
            onClick={handleFilter}
            className="bg-[#B1B1B1] text-white text-md rounded-none flex w-full sm:w-[24.8%] px-4 h-10"
          >
            Apply Filters
          </Button>
        </div>
        // </div>
      )}
      <Modal
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            UPLOAD APPLICANTS
          </span>
        }
        visible={isUploadModalVisible}
        onCancel={handleUploadModalClose}
        width={1000}
        footer={null}
        styles={styles}
      >
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <label htmlFor="" className="text-[#0C743F]">
              <span className="text-red-700">* </span>Select a service to upload
              applicants to:{" "}
            </label>
            <Select
              className="w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500"
              onChange={(value) => selectService(value)}
              value={activeService || undefined}
              placeholder="Select Services"
            >
              {activeServices.map((service) => (
                <Select.Option key={service._id} value={service._id}>
                  {service.name}
                </Select.Option>
              ))}
            </Select>
            {isSubmitAttempted && !activeService && (
              <span className="text-red-500">Please select a service.</span>
            )}
          </div>
          <div>
            <label htmlFor="" className="text-[#0C743F]">
              <span className="text-red-700">* </span>Select business type
              applicants belongs to:{" "}
            </label>
            <Select
              className="w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500"
              onChange={(value) => setBusinessType(value)}
              placeholder="Select Business Type"
              value={businessType}
            >
              <Select.Option key={"1"} value="1">
                Individual
              </Select.Option>
              <Select.Option key={"2"} value="2">
                SME
              </Select.Option>
            </Select>
            {isSubmitAttempted && !businessType && (
              <span className="text-red-500">
                Please select a business type.
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <div>
              Download the file template for Individual applicants' information
            </div>
            <div className="bg-[#ECF4F0] flex px-3 py-3 gap-8 cursor-pointer">
              <a
                href="/upload-applicants-template.xlsx"
                download="upload-applicants-template.xlsx"
                className="flex items-center justify-center w-full gap-8 cursor-pointer"
              >
                <img src={upload} alt="" />
                <div className="items-center justify-center">
                  <div className="text-[#0C743F] font-bold">
                    CLICK HERE TO DOWNLOAD
                  </div>
                  <div>Filename.csv - 0,000 Kb</div>
                </div>
              </a>
            </div>
          </div>
          <div>
            <div>
              Download the file template for SME applicants' information
            </div>
            <div className="bg-[#ECF4F0] flex px-3 py-3 gap-8 cursor-pointer">
              <a
                href="/Sme-applicants-template.xlsx"
                download="Sme-applicants-template.xlsx"
                className="flex items-center justify-center w-full gap-8 cursor-pointer"
              >
                <img src={upload} alt="" />
                <div className="items-center justify-center">
                  <div className="text-[#0C743F] font-bold">
                    CLICK HERE TO DOWNLOAD
                  </div>
                  <div>Filename.csv - 0,000 Kb</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#0C743F] rounded-none hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <img src={VectorUpload} alt="" className="w-15 h-15 my-1" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  Drag or Upload the filled file template
                </span>{" "}
              </p>
              <p className="text-xs text-gray-500">CSV Format</p>
            </div>
            <input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              accept=".csv"
              className="w-full py-2 px-3 border rounded-md mt-2 hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {isSubmitAttempted && !file && (
          <span className="text-red-500">Please select a file.</span>
        )}

        {file ? (
          <div className="flex items-center py-2">
            {file.name} - {Math.round(file.size / 1024)} Kb
            <CloseOutlined
              onClick={handleRemoveFile}
              style={{ cursor: "pointer", marginLeft: 8 }}
              className="bg-red-100 text-red-600"
            />
          </div>
        ) : (
          <div className="flex text-sm py-1">No file selected</div>
        )}

        <div className="flex flex-col items-center justify-center w-full bg-[#ECF4F0] p-4">
          <div className="title font-bold text-lg py-2">
            UPLOADED APPLICANTS SUMMARY
          </div>
          <div className="w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">Service Requested</div>
              <div className="text-left font-bold">
                {selectedServiceName || "None"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">Applicants Count</div>
              <div className="text-left font-bold">{applicantsCount}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            onClick={handleContactsFileUpload}
            disabled={isSubmitDisabled || isUploading}
            className="bg-[#0C743F] text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] rounded-none py-2 px-8 my-2 transition-colors font-bold cursor-pointer"
          >
            {isUploading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 10 }} spin />}
                className="text-[#0C743F] px-4 py-2 rounded"
              />
            ) : (
              "UPLOAD"
            )}
          </button>
        </div>
      </Modal>

      <SuccessModal
        isSuccessModalVisible={isSuccessModalVisible}
        handleSuccessModalOk={onSuccessModalClose}
      />
      {loading ? (
        <div className="text-center">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
            tip="Loading..."
            className="text-[#0C743F]"
          />
        </div>
      ) : showMessage ? (
        <div className="flex items-center justify-center select-none">
          <div className="w-full max-w-md text-center">
            <img
              src={nodata}
              alt="Company Logo"
              className="pointer-events-none select-none"
              draggable="false"
            />
            <h1 className="text-3xl font-bold text-gray-800">
              No applicant data available.
            </h1>
            <p className="text-black text-sm font-normal">
              Please apply a filter to see results.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8">
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
        </div>
      )}
      {selectedFarmer && (
        <>
          <Modal
            title={
              <span style={{ color: "#0C743F", fontSize: "20px" }}>
                Application Details
              </span>
            }
            visible={isModalVisible}
            onCancel={handleCloseModal}
            styles={styles}
            footer={null}
            closeIcon={null}
          >
            <div>
              <p>
                <strong>Firstname:</strong> {selectedFarmer.firstName}
              </p>
              <p>
                <strong>Enterprise:</strong>{" "}
                {selectedFarmer.enterpriseName || ""}
              </p>
              <p>
                <strong>Lastname:</strong> {selectedFarmer.lastName}
              </p>
              <p>
                <strong>National ID:</strong> {selectedFarmer.nationalId}
              </p>
              <p>
                <strong>Phone Number:</strong> {selectedFarmer.phoneNumber}
              </p>
              <p>
                <strong>Education Level:</strong>{" "}
                {getEducationLevel(selectedFarmer.educationLevel)}
              </p>
              <p>
                <strong>Business Type:</strong>{" "}
                {getBusinessType(selectedFarmer.businessType)}
              </p>
              <p>
                <strong>Employment Status:</strong>{" "}
                {getEmploymentStatus(selectedFarmer.employmentStatus)}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {`${selectedFarmer.location.province.name}, ${selectedFarmer.location.district.name}, ${selectedFarmer.location.sector.name}`}
              </p>
              {selectedFarmer.businessType !== 1 && (
                <>
                  <p>
                    <strong>SME Category:</strong>{" "}
                    {getSmeCategory(selectedFarmer.smeCategory)}
                  </p>
                  <p>
                    <strong>Enterprise:</strong>{" "}
                    {selectedFarmer.enterpriseName || "-"}
                  </p>
                </>
              )}
              <p>
                <strong>Date of Birth:</strong> {selectedFarmer.dateOfBirth}
              </p>
              <p>
                <strong>Age:</strong> {selectedFarmer.age}
              </p>
              <p>
                <strong>Gender:</strong> {getGender(selectedFarmer.gender)}
              </p>
              <p>
                <strong>Marital Status:</strong>{" "}
                {getMaritalStatus(selectedFarmer.maritalStatus)}
              </p>

              <p>
                <strong>Employment Status:</strong>{" "}
                {getEmploymentStatus(selectedFarmer.employmentStatus)}
              </p>
              <p>
                <strong>Employment Type:</strong>{" "}
                {getEmploymentType(selectedFarmer.employmentType)}
              </p>
              <p>
                <strong>Has Disability:</strong>{" "}
                {selectedFarmer.hasDisability || "-"}
              </p>
              <p>
                <strong>Is A Refugee:</strong>{" "}
                {selectedFarmer.isARefugee || "-"}
              </p>
              <p>
                <strong>Is Active Student:</strong>{" "}
                {selectedFarmer.isActiveStudent || "-"}
              </p>
            </div>
            <div className="flex">
              <button
                type="submit"
                onClick={() => setIsModalVisible(false)}
                className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
              >
                Close
              </button>
            </div>
          </Modal>
          <EditFarmerDrawer
            visible={isDrawerVisible}
            selectedRecord={selectedFarmer}
            onClose={handleDrawerClose}
            onFarmerUpdated={handleFarmerUpdated}
          />
        </>
      )}
    </>
  );
};

export default Farmers;
