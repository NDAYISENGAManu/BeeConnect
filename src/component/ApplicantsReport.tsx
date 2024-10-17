/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import SelectField from "../reusable/SelectField";
// import NoFilterData from "../reusable/NoFilterData";
import nodata from "../assets/find.svg";
import { Table, Spin, TablePaginationConfig, DatePicker } from "antd";
import { EyeFilled, FilterOutlined, LoadingOutlined } from "@ant-design/icons";
import { checkHasPolicy } from "../helper/app.helper";
import { getOrganizations, getOrganizationById } from "../api/server";
import { userOrganizationId } from "../helper/data.helper";
import { base64ToBlob } from "../helper/app.helper";
import { applicantsSource } from "../reusable/data";
import { api } from "../api";
import {
  getEducationLevel,
  getBusinessType,
  getEmploymentStatus,
  getSmeCategory,
  getMaritalStatus,
} from "../types/utils";

const { RangePicker } = DatePicker;

const ApplicantsReport: React.FC = () => {
  const [partners, setPartners] = useState([]);
  const [services, setServices] = useState([]);
  const [, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems] = useState(0);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [totalRegistered, setTotalRegistered] = useState(0);
  const onFilterClick = async () => {
    getApplicants();
    setIsFiltered(true);
  };

  const handleDateChange = (_dates: any, dateStrings: [string, string]) => {
    setFilters((values: any) => ({
      ...values,
      from: dateStrings[0],
      to: dateStrings[1],
    }));
  };

  const getApplicants = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/applicants", {
        params: {
          ...filters,
          page: currentPage,
          // size: pageSize,
        },
      });
      if (data.status == 200) {
        const applicants = data.data.data;
        setTotalRegistered(data.data.meta.total);
        applicants.map((el: any) => {
          el.gender = el.gender == "M" ? "Male" : "Female";
          el.date = new Date(el.created_at).toLocaleDateString();
          el.key = el._id;
          el.education = getEducationLevel(el.educationLevel);
          el.businesstype = getBusinessType(el.businessType);
          el.employment = getEmploymentStatus(el.employmentStatus);
          el.sme = getSmeCategory(el.smeCategory);
          el.maritalstatus = getMaritalStatus(el.maritalStatus);
        });
        setApplicants(applicants);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const handlePageChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;

    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPageSize(pageSize);
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
      const { data } = await api.get(`/api/v1/applicants/reports`, {
        params: {
          ...filters,
          page: currentPage,
        },
      });
      if (data.status == 200) {
        const res = data.data;
        downloadFile(res.file, "reports");
      }
    } catch (error) {
      //
    }
  };

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number[],
    requiredOrgType: number[]
  ) => {
    return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
  };

  const onChangeOrganization = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value, name } = e.target;
    const { data } = await getOrganizationById(value);
    if (data.servicesProvided) {
      const { servicesProvided } = data;
      servicesProvided.map((el: any) => {
        el.key = el.name;
        el.value = el._id;
      });
      setServices(servicesProvided);
    }
    setFilters((values) => ({
      ...values,
      [name]: value,
    }));
  };

  const onElementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((values) => ({
      ...values,
      [name]: value,
    }));
  };

  const getUserOrganizationDetails = async () => {
    const orgId = userOrganizationId();
    try {
      const res = await getOrganizationById(orgId);
      if (res) {
        const { servicesProvided } = res.data;
        servicesProvided.map((el: any) => {
          el.key = el.name;
          el.value = el._id;
        });
        setServices(servicesProvided);
      }
    } catch (error) {
      //
    }
  };

  useEffect(() => {
    async function orgs() {
      const { data } = await getOrganizations();
      data.map((el: any) => {
        el.value = el._id;
        el.key = el.name;
      });
      setPartners(data);
    }
    orgs();
  }, []);

  useEffect(() => {
    getUserOrganizationDetails();
  }, []);

  useEffect(() => {
    getApplicants();
  }, [currentPage, pageSize]);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[#0C743F] text-2xl font-bold leading-[28.13px] text-left">
        Applicants
      </h1>
      <div className="w-full flex flex-col sm:flex-row h-auto top-[200px] bg-[#E8E8E8] px-2 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full space-y-2 sm:space-y-0 sm:space-x-2">
          {hasAccess([], [1, 2], [1]) && (
            <SelectField
              id="partners"
              name="orgId"
              isRequired={true}
              classname="flex-grow bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full sm:w-[25%]"
              selectType="All Partners"
              handleChange={onChangeOrganization}
              selectOptions={partners}
            />
          )}
          <SelectField
            id="allservices"
            name="serviceId"
            isRequired={true}
            classname="flex-grow bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full sm:w-[25%]"
            selectType="All services"
            handleChange={onElementChange}
            selectOptions={services}
          />
          <RangePicker
            onChange={handleDateChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-2/4"
          />
          <button
            className="bg-[#B1B1B1] text-white flex items-center rounded-none w-full sm:w-[25%] h-10 px-2 py-2 text-sm hover:text-[#0C743F] hover:bg-white border hover:border-[#0C743F] transition-colors transform-cpu justify-center"
            onClick={onFilterClick}
          >
            <span className="mr-1">
              <FilterOutlined />
            </span>
            Filter
          </button>
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

      <div className="text-center">
        {loading && (
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
            tip="Loading..."
            className="text-[#0C743F]"
          />
        )}
      </div>
      <div className="flex flex-col justify-center bg-gray-200 h-10">
        <h1 className="text-[#0C743F] text-1xl font-bold pt-2">
          We have registered applicants (<span>{totalRegistered}</span>)
        </h1>
      </div>
      {applicants.length > 0 && (
        <Table
          columns={applicantsSource}
          dataSource={applicants}
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
          scroll={{ x: "100%" }}
          className="ant-table"
          rowKey="_id"
          onChange={handlePageChange}
        />
      )}
      {!applicants.length && !loading && (
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
      )}
    </div>
  );
};

export default ApplicantsReport;
