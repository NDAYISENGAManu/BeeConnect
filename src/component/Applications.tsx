/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  TablePaginationConfig,
  Button,
  Modal,
  Dropdown,
  Menu,
  Input,
  message,
  Spin,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { api } from "../api";
import { mapLocations, getOrganizationById } from "../api/server";
import {
  DashOutlined,
  EditFilled,
  EyeFilled,
  FilterOutlined,
  LoadingOutlined,
  RestFilled,
  SafetyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import success from "../assets/success.svg";
import transfer from "../assets/transfer.svg";
import transfers from "../assets/transfer1.svg";
import icoerror from "../assets/ico_error.svg";
import { userOrganizationId } from "../helper/data.helper";
import {
  getBusinessType,
  getLandOwnershipType,
  getSmeCategory,
} from "../types/utils";
import nodata from "../assets/find.svg";
import { Application, MapLocations } from "../types/globalData";
import { checkHasPolicy } from "../helper/app.helper";
import TransferModal from "./TransferModal";
import GroupTransferModal from "./GroupTransferModal";
import EditApplicationDrawer from "./EditApplicationDrawer";
import { base64ToBlob } from "../helper/app.helper";

interface FilterPayload {
  organizationId?: string;
  serviceId?: string;
  approvalStatus?: number;
  location?: {
    prov_id?: string;
    dist_id?: string;
    sect_id?: string;
  };
}

// export enum landOwnership {
//   NUBWANGE = 1,
//   NDABUKODESHA = 2,
//   BURAVANZE = 3,
// }

enum KnowledgeLevel {
  NOT_EXPERIENCED = 1,
  BASIC_KNOWLEDGE,
  EXPERIENCED,
}

enum ApprovalStatus {
  REJECTED = 1,
  PENDING = 2,
  APPROVED = 3,
}
export interface Organization {
  _id: string;
  name: string;
}

const Applications: React.FC = () => {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Application | null>(
    null
  );
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [groupTransferModal, setGroupTransferModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [loadingButtons, setLoadingButtons] = useState(false);
  const [orginalData, setOrginalData] = useState([]);
  const [filters, setFilters] = useState<{
    organizationId?: string;
    serviceId?: string;
    approvalStatus?: number;
    prov_id?: string;
    dist_id?: string;
    sect_id?: string;
  }>({});
  const isAnyFilterSelected = Object.values(filters).some(
    (value) => value !== ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [locations, setLocations] = useState<MapLocations[]>([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    string[]
  >([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [regionOptions, setRegionOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [showMessage, setShowMessage] = useState(true);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get("/api/v1/organization");
      const { data } = response.data;
      setOrginalData(data);
      const orgData = response.data.data.map((org: any) => ({
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

  const fetchServices = async () => {
    try {
      const response = await api.get("/api/v1/service");
      const servicesData = response.data.data.map((service: any) => ({
        _id: service._id,
        name: service.name,
      }));
      if (response.data.status === 200) {
        setServices(servicesData);
      }
    } catch (error) {
      // console.error("Error fetching organizations:", error);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    // Set the current page and page size
    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const handleApplicationUpdate = () => {
    fetchData();
  };

  const fetchData = async (page = currentPage) => {
    setLoading(true);
    setShowMessage(false);

    try {
      const location: {
        prov_id?: string;
        dist_id?: string;
        sect_id?: string;
      } = {};

      if (filters.prov_id) {
        location.prov_id = filters.prov_id;
      }
      if (filters.dist_id) {
        location.dist_id = filters.dist_id;
      }
      if (filters.sect_id) {
        location.sect_id = filters.sect_id;
      }

      const payload: FilterPayload = {
        organizationId: filters.organizationId,
        serviceId: filters.serviceId,
        approvalStatus: filters.approvalStatus,
        location: Object.keys(location).length > 0 ? location : undefined,
      };

      const response = await api.post(
        `/api/v1/application/filter?page=${page}`,
        payload
      );
      if (response.status === 404) {
        setShowMessage(true);
        setData([]);
      } else {
        const applications: Application[] = response.data.data.map(
          (item: any) => ({
            key: item._id,
            date: new Date(item.created_at).toLocaleDateString(),
            serviceName: item.service.name,
            organizationName: item.organization.name,
            userName: item.userId
              ? `${item.userId.firstName} ${item.userId.lastName}`
              : "N/A",
            educationLevel: item.userId
              ? renderEducationLevel(item.userId.educationLevel)
              : "N/A",
            approvalStatus: item.approvalStatus,
            phoneNumber: item.userId?.phoneNumber,
            businessType: item.userId?.businessType,
            smeCategory: item.userId?.smeCategory,
            landSize: item.landSize,
            knowledgeLevel: item.knowledgeLevel
              ? renderKnowledgeLevel(item.knowledgeLevel)
              : "N/A",
            locationDetails: item.location
              ? {
                  province: item.location.province.name,
                  district: item.location.district.name,
                  sector: item.location.sector.name,
                }
              : undefined,
            transferredBy: {
              id: item.transferredBy?.id || null,
              name: item.transferredBy?.name || "N/A",
              when: item.transferredBy?.when || "N/A",
            },
            transferredFrom: {
              id: item.transferredFrom?.id,
              name: item.transferredFrom?.name,
            },
            transferReason: item.transferReason?.transferReason,
            type: item.type,
            rejectionReason: item.rejectionReason,
            approvedBy: item.approvedBy,
            totalLandSizeOwned: item.totalLandSizeOwned,
            totalLandSizeAccessed: item.totalLandSizeAccessed,
            landOwnership: item.landOwnership,
          })
        );

        setData(applications);
        setShowMessage(false);
        setTotalItems(response.data.meta.total);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setShowMessage(true);
        setData([]);
      } else {
        // console.error("Error fetching data:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  const getLocations = async () => {
    const res = await mapLocations();
    setLocations(res);
    fetchProvince(res);
  };

  const getMyOrganization = async () => {
    try {
      const orgId = userOrganizationId();
      const res = await getOrganizationById(orgId);
      if (checkHasPolicy([], [2], [2]) && res) {
        const { servicesProvided } = res.data;
        setServices(servicesProvided);
      }
    } catch (error) {
      //
    }
  };

  const fetchDistricts = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const province: any = locations.find((el: any) => el._id === value);
    const { districts } = province;
    const formatKeys = districts.map((district: any) => ({
      label: district.name,
      value: district._id,
    }));
    setDistrictOptions(formatKeys);
  };

  const onSelectOrganization = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setServices([]);
    const selectedOrganization: any = orginalData.find(
      (el: any) => el._id === value
    );
    setServices(selectedOrganization.servicesProvided);
  };

  const fetchProvince = async (regions: MapLocations[]) => {
    const regionOptions = regions.map((prov: any) => ({
      label: prov.name,
      value: prov._id,
    }));
    setRegionOptions(regionOptions);
  };

  useEffect(() => {
    fetchOrganizations();
    fetchServices();
    getLocations();
  }, []);

  useEffect(() => {
    getMyOrganization();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleFilterButtonClick = () => {
    fetchData(currentPage);
  };

  const handleApprove = async (record: Application) => {
    try {
      setLoadingButtons(true);
      const response = await api.put(
        `/api/v1/application/id/${record.key}/approve`,
        {
          approvalStatus: 3,
        }
      );
      if (response.status === 200) {
        setStatusMessage("Application approved successfully.");
        setStatusCode(200);
        setStatusModalVisible(true);
        fetchData(currentPage);
      }
    } catch (error: unknown) {
      let errorMessage = "An error occurred. Please try again.";

      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data;

        if (
          apiError &&
          apiError.error &&
          typeof apiError.error.message === "string"
        ) {
          errorMessage = apiError.error.message;
        } else if (typeof apiError.message === "string") {
          errorMessage = apiError.message;
        }

        setStatusCode(error.response.status || 500);
      } else {
        setStatusCode(500);
      }

      setStatusMessage(errorMessage);
      setStatusModalVisible(true);
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleReject = (record: Application) => {
    setSelectedRecord(record);
    setShowRejectionModal(true);
  };

  const handleTransfer = (record: Application) => {
    setSelectedRecord(record);
    setShowTransferModal(true);
  };

  const handleView = (record: Application) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (application: Application) => {
    setSelectedRecord(application);
    setFilters({});
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedRecord(null);
  };

  const handleApplicationUpdated = () => {
    fetchData();
  };

  const ActionMenu = ({ record }: { record: Application }) => (
    <Dropdown
      overlay={
        <Menu className="gap-3">
          {record.approvalStatus === 2 && (
            <>
              {hasAccess([], [1, 2], [2]) && (
                <>
                  <li
                    key="approve"
                    className="bg-green-600 hover:bg-green-800 text-white px-2 py-1 my-1 rounded-md cursor-pointer"
                    onClick={() => handleApprove(record)}
                  >
                    <SafetyOutlined className="pr-2" />
                    Approve
                  </li>

                  <li
                    key="reject"
                    onClick={() => handleReject(record)}
                    className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded-md cursor-pointer"
                  >
                    <RestFilled className="pr-2" />
                    Reject
                  </li>
                  <li
                    key="transfer"
                    onClick={() => handleTransfer(record)}
                    className="text-[#CD43E4] bg-gray-200 hover:bg-gray-100 px-2 py-1 rounded-md cursor-pointer flex mt-1"
                  >
                    <img src={transfer} alt="" className="pr-2 w-6" />
                    Transfer
                  </li>
                  {record.landSize && (
                    <li
                      key="edit"
                      onClick={() => handleEdit(record)}
                      className="text-[#FFA928] bg-gray-200 hover:bg-gray-100 px-2 py-1 rounded-md cursor-pointer flex mt-1 gap-2"
                    >
                      <span className="pr-2 w-6">
                        <EditFilled className="text-[#FFA928]" />
                      </span>
                      Edit
                    </li>
                  )}
                </>
              )}
              <li
                key="view"
                onClick={() => handleView(record)}
                className="bg-gray-600 hover:bg-gray-800 text-white px-2 py-1 rounded-md cursor-pointer my-1"
              >
                <EyeFilled className="pr-2" />
                View
              </li>
            </>
          )}
        </Menu>
      }
      trigger={["click"]}
    >
      <Button
        type="text"
        icon={<DashOutlined />}
        className="text-gray-600 hover:text-gray-800 bg-gray-100"
      />
    </Dropdown>
  );

  const columns: ColumnsType<Application> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Partners",
      dataIndex: "organizationName",
      key: "organizationName",
    },
    {
      title: "Participants",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Education Level",
      dataIndex: "educationLevel",
      key: "educationLevel",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Knowledge Level",
      dataIndex: "knowledgeLevel",
      key: "knowledgeLevel",
    },
    {
      title: "Approval Status",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      render: (approvalStatus: number) => {
        let statusText;
        let statusClass;

        switch (approvalStatus) {
          case ApprovalStatus.APPROVED:
            statusText = "Approved";
            statusClass = "status-active";
            break;
          case ApprovalStatus.PENDING:
            statusText = "Pending";
            statusClass = "status-pending-live";
            break;
          case ApprovalStatus.REJECTED:
            statusText = "Rejected";
            statusClass = "status-inactive";
            break;
          default:
            statusText = "Unknown";
            statusClass = "status-unknown";
        }
        return <span className={`${statusClass}`}>{statusText}</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        hasAccess([], [1, 2], [1]) ? (
          <a
            onClick={() => handleView(record)}
            className="text-white px-2 py-1 rounded-md cursor-pointer my-1"
          >
            <EyeFilled
              style={{ fontSize: "20px", color: "#0C743F" }}
              className="border px-1"
            />
          </a>
        ) : record.approvalStatus === 3 ? (
          <a
            onClick={() => handleView(record)}
            className="text-white px-2 py-1 rounded-md cursor-pointer my-1"
          >
            <EyeFilled
              style={{ fontSize: "20px", color: "#0C743F" }}
              className="border px-1"
            />
          </a>
        ) : record.approvalStatus === 1 ? (
          <a
            onClick={() => handleView(record)}
            className="text-white px-2 py-1 rounded-md cursor-pointer my-1"
          >
            <EyeFilled
              style={{ fontSize: "20px", color: "#0C743F" }}
              className="border px-1"
            />
          </a>
        ) : (
          <ActionMenu record={record} />
        ),
    },
  ];

  const renderApprovalStatus = (approvalStatus: number) => {
    switch (approvalStatus) {
      case ApprovalStatus.REJECTED:
        return "REJECTED";
      case ApprovalStatus.PENDING:
        return "PENDING";
      case ApprovalStatus.APPROVED:
        return "APPROVED";
      default:
        return "-";
    }
  };

  const renderEducationLevel = (educationLevel: number) => {
    switch (educationLevel) {
      case 1:
        return "PRIMARY";
      case 2:
        return "SECONDARY";
      case 3:
        return "TVET";
      case 4:
        return "UNIVERSITY";
      case 5:
        return "NONE";
      default:
        return "-";
    }
  };

  const renderKnowledgeLevel = (knowledgeLevel: number) => {
    switch (knowledgeLevel) {
      case KnowledgeLevel.NOT_EXPERIENCED:
        return "Not Experienced";
      case KnowledgeLevel.BASIC_KNOWLEDGE:
        return "Basic Knowledge";
      case KnowledgeLevel.EXPERIENCED:
        return "Experienced";
      default:
        return "Unknown";
    }
  };

  const downloadFile = (base64: string, filename: string) => {
    const blob = base64ToBlob(base64, "text/csv");
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onDownloadClick = async () => {
    try {
      const location: {
        prov_id?: string;
        dist_id?: string;
        sect_id?: string;
      } = {};

      if (filters.prov_id) {
        location.prov_id = filters.prov_id;
      }
      if (filters.dist_id) {
        location.dist_id = filters.dist_id;
      }
      if (filters.sect_id) {
        location.sect_id = filters.sect_id;
      }

      const payload: FilterPayload = {
        organizationId: filters.organizationId,
        serviceId: filters.serviceId,
        approvalStatus: filters.approvalStatus,
        location: Object.keys(location).length > 0 ? location : undefined,
      };
      const { data } = await api.post(`/api/v1/application/reports`, payload);
      if (data.status == 200) {
        const res = data.data;
        downloadFile(res.file, "reports");
      }
    } catch (error) {
      //
    }
  };

  const changeStatus = async (
    record: Application,
    newStatus: number,
    rejectionReason: string
  ) => {
    if (newStatus === ApprovalStatus.REJECTED && !rejectionReason.trim()) {
      message.error("Rejection reason cannot be empty.");
      return;
    }

    const payload: {
      approvalStatus: number;
      rejectionReason?: string;
    } = {
      approvalStatus: newStatus,
    };

    if (newStatus === ApprovalStatus.REJECTED) {
      payload.rejectionReason = rejectionReason;
    }
    setLoadingButtons(true);

    try {
      const response = await api.put(
        `/api/v1/application/id/${record.key}/approve`,
        payload
      );

      setData((prevData) =>
        prevData.map((item) =>
          item.key === record.key
            ? {
                ...item,
                approvalStatus: newStatus,
              }
            : item
        )
      );

      setStatusMessage("Status changed successfully!");
      setStatusCode(response.status);
      setStatusModalVisible(true);
      setShowRejectionModal(false);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";

      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data;

        if (
          apiError &&
          apiError.error &&
          typeof apiError.error.message === "string"
        ) {
          errorMessage = apiError.error.message;
        } else if (typeof apiError.message === "string") {
          errorMessage = apiError.message;
        }

        setStatusCode(error.response.status || 500);
      } else {
        setStatusCode(500);
      }
      setStatusMessage(errorMessage);
      setStatusModalVisible(true);
      setShowRejectionModal(false);
      setRejectionReason("");
    } finally {
      setLoadingButtons(false);
    }
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

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number[],
    requiredOrgType: number[]
  ) => {
    return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          <span>Applications</span>
        </h2>
      </div>
      <div className="flex items-center justify-between bg-[#E8E8E8] mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full space-y-2 sm:space-y-0 sm:space-x-2 pt-2 px-2 mb-2">
          {hasAccess([], [1, 2], [1]) && (
            <>
              <select
                name="organizationId"
                value={filters.organizationId}
                onChange={onSelectOrganization}
                className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
              >
                <option value="all_organisation">All Partners</option>
                {organizations.map((organization) => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <select
            name="serviceId"
            value={filters.serviceId}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option value="all_services">All Services</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
          <select
            name="approvalStatus"
            value={filters.approvalStatus}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option>Status</option>
            <option key={"1"} value="1">
              Rejected
            </option>
            <option key={"2"} value="2">
              Pending
            </option>
            <option key={"3"} value="3">
              Approved
            </option>
          </select>
          <select
            name="prov_id"
            value={filters.prov_id || ""}
            onChange={(e) => {
              handleFilterChange(e);
              fetchDistricts(e);
            }}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option value="all_province">All Province</option>
            {regionOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            name="dist_id"
            value={filters.dist_id || ""}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option value="all_district">All Districts</option>
            {districtOptions.map((district) => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
          </select>

          <Button
            className={`flex items-center rounded-none h-10 w-full md:w-1/4 ${
              isAnyFilterSelected
                ? "bg-[#0C743F] text-white"
                : "bg-gray-300 text-black"
            }`}
            onClick={handleFilterButtonClick}
          >
            <span className="mr-1">
              <FilterOutlined />
            </span>
            Filter
          </Button>

          <button
            className="bg-[#0C743F] text-sm text-white hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu flex items-center justify-center rounded-none w-full sm:w-[25%] h-10 px-2 py-2"
            onClick={onDownloadClick}
          >
            <span className="mr-1">
              <EyeFilled />
            </span>
            Download
          </button>
        </div>
      </div>
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
              No application available.
            </h1>
            <p className="text-black text-sm font-normal">
              Please apply a filter to see results.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-20">
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
                      className="rounded-none p-0"
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
            rowSelection={{
              selectedRowKeys: selectedApplicationIds,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange: setSelectedApplicationIds,
              getCheckboxProps: (record) => ({
                disabled:
                  record.approvalStatus === 3 || record.approvalStatus === 1,
              }),
            }}
          />
          {!hasAccess([], [1, 2], [1]) && (
            <button
              className="flex bg-[#CD43E3] rounded-none hover:bg-[#e161f5] px-4 py-2 text-white"
              disabled={selectedApplicationIds.length === 0}
              onClick={() => setGroupTransferModal(true)}
            >
              {/* Transfer Selected */}
              <img src={transfers} alt="" className="pr-2 w-6" />
              Transfer
            </button>
          )}
        </div>
      )}
      <Modal
        title={
          <span style={{ color: "#008532", fontSize: "20px" }}>
            Application Details
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        styles={styles}
        footer={null}
        closeIcon={null}
      >
        {selectedRecord && (
          <div>
            <p>
              <strong>Service Name:</strong> {selectedRecord.serviceName}
            </p>
            <p>
              <strong>Organization Name:</strong>{" "}
              {selectedRecord.organizationName}
            </p>
            {selectedRecord.enterprise && (
              <p>
                <strong>Enterprise:</strong>{" "}
                {selectedRecord.enterprise?.name || ""}
              </p>
            )}
            <p>
              <strong>Participant Name:</strong> {selectedRecord.userName}
            </p>{" "}
            <p>
              <strong>Phone Number:</strong> {selectedRecord.phoneNumber}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {selectedRecord?.locationDetails
                ? `${selectedRecord.locationDetails.province}, ${selectedRecord.locationDetails.district}, ${selectedRecord.locationDetails.sector}`
                : "N/A"}
            </p>
            <p>
              <strong>Education Level:</strong> {selectedRecord.educationLevel}
            </p>
            <p>
              <strong>Business Type:</strong>{" "}
              {selectedRecord.businessType !== undefined
                ? getBusinessType(selectedRecord.businessType)
                : "N/A"}
            </p>
            <p>
              <strong>SME category:</strong>{" "}
              {selectedRecord.smeCategory !== undefined
                ? getSmeCategory(selectedRecord.smeCategory)
                : "N/A"}
            </p>
            <p>
              <strong>Knowledge Level:</strong> {selectedRecord.knowledgeLevel}
            </p>
            <p>
              <strong>Rejection Reason:</strong>{" "}
              {selectedRecord.rejectionReason || "N/A"}
            </p>
            {selectedRecord.totalLandSizeOwned && (
              <p>
                <strong>Land size:</strong> {selectedRecord.totalLandSizeOwned}
              </p>
            )}
            {selectedRecord.totalLandSizeAccessed && (
              <p>
                <strong>Land size (hectare) accessed:</strong>{" "}
                {selectedRecord.totalLandSizeAccessed}
              </p>
            )}
            {selectedRecord.landOwnership && (
              <p>
                <strong>Land Owner:</strong>{" "}
                {getLandOwnershipType(Number(selectedRecord.landOwnership)) ||
                  "N/A"}
              </p>
            )}
            {selectedRecord.transferredBy && (
              <>
                <p>
                  <strong>Transferred By:</strong>{" "}
                  {selectedRecord.transferredBy?.name}
                </p>
                <p>
                  <strong>Transferred when:</strong>{" "}
                  {selectedRecord.transferredBy?.when}
                </p>
              </>
            )}
            {selectedRecord.transferredFrom && (
              <>
                <p>
                  <strong>Transferred From:</strong>{" "}
                  {selectedRecord.transferredFrom?.name || "N/A"}
                </p>
              </>
            )}
            {selectedRecord.transferReason && (
              <>
                <p>
                  <strong>Transfer Reason :</strong>{" "}
                  {selectedRecord.transferReason}
                </p>
              </>
            )}
            <p>
              <strong>Approval Status:</strong>{" "}
              {renderApprovalStatus(selectedRecord.approvalStatus)}
            </p>
            <p>
              <strong>Approved By:</strong>{" "}
              {selectedRecord.approvedBy
                ? `${selectedRecord.approvedBy.name} on ${new Date(
                    selectedRecord.approvedBy.when
                  ).toLocaleDateString()} at ${new Date(
                    selectedRecord.approvedBy.when
                  ).toLocaleTimeString()}`
                : "N/A"}
            </p>
          </div>
        )}
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
      <Modal
        open={showRejectionModal}
        onCancel={() => setShowRejectionModal(false)}
        footer={null}
      >
        <h2>Rejection Reason</h2>
        <Input.TextArea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
        />
        {rejectionReason.length < 5 && (
          <p className="text-gray-400 my-0">+ Minimum 5 characters required</p>
        )}
        <div className="flex">
          <button
            type="submit"
            onClick={() =>
              selectedRecord &&
              changeStatus(
                selectedRecord,
                ApprovalStatus.REJECTED,
                rejectionReason
              )
            }
            disabled={loadingButtons || rejectionReason.length < 5}
            className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
          >
            {loadingButtons ? (
              <>
                <span>Reject Application</span>
                <Spin
                  className="ml-5"
                  indicator={
                    <LoadingOutlined
                      spin
                      className="text-[#0C743F] font-extrabold"
                    />
                  }
                />
              </>
            ) : (
              <span>Reject Application</span>
            )}
          </button>
        </div>
      </Modal>{" "}
      {showTransferModal && (
        <TransferModal
          visible={showTransferModal}
          selectedRecord={selectedRecord}
          onCancel={() => setShowTransferModal(false)}
          onApplicationUpdate={handleApplicationUpdate}
        />
      )}
      <GroupTransferModal
        visible={groupTransferModal}
        onCancel={() => setGroupTransferModal(false)}
        selectedRecords={selectedApplicationIds}
        onApplicationUpdate={handleApplicationUpdate}
      />
      <Modal
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        styles={styles}
        footer={null}
        closeIcon={null}
      >
        <div style={{ textAlign: "center" }}>
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
                  onClick={() => setStatusModalVisible(false)}
                  className="lg:w-[32%] sm:w-full p-5 text-[#0C743F] font-bold rounded-none"
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
      <EditApplicationDrawer
        visible={isDrawerVisible}
        selectedRecord={selectedRecord}
        onClose={handleDrawerClose}
        onApplicationUpdated={handleApplicationUpdated}
      />
    </>
  );
};

export default Applications;
