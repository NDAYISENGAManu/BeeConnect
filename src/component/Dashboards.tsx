/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import farmers from "../assets/farmers.svg";
import handshake from "../assets/handshake.svg";
import { useAuth } from "../context/AuthContext";
import MapComponent from "./MapComponent";
import { FilterOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Spin, DatePicker } from "antd";
import axios from "axios";
import nodata from "../assets/find.svg";
import { mapLocations, getOrganizationById } from "../api/server";
import { MapLocations } from "../types/globalData";
import { checkHasPolicy } from "../helper/app.helper";
import { userOrganizationId } from "../helper/data.helper";
import PieChartDisabilityData from "./PieChartDisabilityData";
import PieChartEducationData from "./PieChartEducationData";
import ServicesApplicationsChart from "./ServicesApplicationsChart";

interface ChartData {
  name: string;
  value: number;
}

interface ServiceData {
  name: string;
  Approved: number;
  Pending: number;
  Rejected: number;
  Requested: number;
}

interface Props {
  data: ChartData[];
  colors: string[];
}

interface Props {
  data: ChartData[];
  colors: string[];
  serviceData: {
    name: string;
    Rejected: number;
    Requested: number;
    amt: number;
  }[];
}

interface FilterOptions {
  orgId: string;
  serviceId: string;
  from: string;
  to: string;
  provinceId: string;
  districtId: string;
  sectorId: string;
  [key: string]: string;
}

export interface Organization {
  _id: string;
  name: string;
}

const COLORS_AGE = ["#0C743F", "#70BF44", "#0088FE", "#00C49F", "#FF4560"];
const COLORS_GENDER = ["#FF69F6", "#35A1FF"];
const COLORS_BARS = ["#00800D", "#FF7723", "#8E30FF", "#FD9AD2", "#F31A56"];
const COLORS_EDU = ["#598DFF", "#7A7EE3", "#A550AC", "#C7C243", "#777777"];

const { RangePicker } = DatePicker;

const Dashboards: React.FC = () => {
  const { firstName, lastName } = useAuth();
  const [locationData, setLocationData] = useState([]);
  const [genderDatas, setGenderData] = useState<ChartData[]>([]);
  const [educationLevels, setEducationLevel] = useState<ChartData[]>([]);
  const [ageDatas, setAgeData] = useState<ChartData[]>([]);
  const [smeCategoryDatas, setSmeCategoryData] = useState<ChartData[]>([]);
  const [servApplicationStatus, setServApplicationStatus] = useState<
    ServiceData[]
  >([]);
  const [employmentStatusData, setEmploymentStatusData] = useState<ChartData[]>(
    []
  );
  const [totalFarmer, setTotalFarmer] = useState();
  const [totalSme, setTotalSme] = useState();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [regionOptions, setRegionOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [disabilitiesData, setDisabilities] = useState<
    { name: string; value: number }[]
  >([]);

  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    orgId: "",
    serviceId: "",
    from: "",
    to: "",
    provinceId: "",
    districtId: "",
    sectorId: "",
  });
  const isAnyFilterSelected = Object.values(filters).some(
    (value) => value !== ""
  );
  const [employmentScore, setEmploymentScore] = useState<number | null>(null);
  const [disabilitiesScore, setDisabilitiesScore] = useState<number>(0);
  const [femaleInclusion, setFemaleInclusion] = useState<number | null>(null);
  const [totalFemale, setTotalFemale] = useState<number | null>(null);
  const [numberOfOrganizations, setNumberOfOrganizations] = useState<
    number | null
  >(null);
  const [locations, setLocations] = useState<MapLocations[]>([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/organization`, {
        headers: { "x-auth-token": token },
      });
      const orgData = response.data.data.map((org: any) => ({
        _id: org._id,
        name: org.name,
      }));

      if (response.data.status === 200) {
        setOrganizations(orgData);
        setNumberOfOrganizations(orgData.length);
      }
    } catch (error) {
      // console.error("Error fetching organizations:", error);
    }
  };

  const getLocations = async () => {
    const res = await mapLocations();
    setLocations(res);
    fetchProvince(res);
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

  const fetchProvince = async (regions: MapLocations[]) => {
    const regionOptions = regions.map((prov: any) => ({
      label: prov.name,
      value: prov._id,
    }));
    setRegionOptions(regionOptions);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = Object.keys(filters).reduce((acc, key) => {
        const typedKey = key as keyof FilterOptions;
        if (filters[typedKey]) acc[typedKey] = filters[typedKey];
        return acc;
      }, {} as Record<keyof FilterOptions, any>);

      const response = await axios.get(`${baseUrl}/api/v1/applicants/stats`, {
        headers: { "x-auth-token": token },
        params,
      });

      const data = response.data.data;
      const { disabilityDistribution } = data;

      if (!data.total) {
        setNoData(true);
      } else {
        setNoData(false);

        const genderMap = { M: "Male", F: "Female" };
        const educationLevelMap = {
          1: "Primary",
          2: "Secondary",
          3: "TVET",
          4: "University",
          5: "none",
        };
        const smeCategoryMap = {
          1: "Invisibles",
          2: "Bootstrappers",
          3: "Gazelles",
          null: "Individual",
        };
        const employmentStatusMap = {
          1: "Employed",
          2: "Unemployed",
          null: "Unknown",
        };

        const fetchedGenderData = data.genderDistribution.map(
          (item: { count: number; gender: string }) => ({
            //@ts-ignore
            name: genderMap[item.gender] || "Unknown",
            value: item.count,
          })
        );

        const fetchedEducationLevel = data.educationLevelDistribution.map(
          (item: { count: number; educationLevel: number }) => ({
            //@ts-ignore
            name: educationLevelMap[item.educationLevel] || "Unknown",
            value: item.count,
          })
        );

        const fetchedAgeData = data.ageDistribution.map(
          (item: { count: number; ageRange: string }) => ({
            name: item.ageRange,
            value: item.count,
          })
        );

        const fetchedSmeData = data.smeCategoryDistribution.map(
          (item: { count: number; smeCategory: number | null }) => ({
            //@ts-ignore
            name: smeCategoryMap[item.smeCategory] || "Unknown",
            value: item.count,
          })
        );

        const fetchEmploymentStatus = data.employmentStatusDistribution.map(
          (item: { count: number; employmentStatus: number | null }) => ({
            //@ts-ignore
            name: employmentStatusMap[item.employmentStatus] || "Unknown",
            value: item.count,
          })
        );
        const formatData: any = [];
        disabilityDistribution.map((el: any) => {
          if (el.hasDisability == "YES") {
            formatData.push({
              name: "With Disabilities",
              value: el.count,
              color: "#103C26",
            });
            setDisabilitiesScore(el.count);
          }
          if (el.hasDisability == "NO") {
            formatData.push({
              name: "Without Disabilities",
              value: el.count,
              color: "#49AA49",
            });
          }
          if (el.hasDisability == null) {
            formatData.push({
              name: "Unknown",
              value: el.count,
              color: "#F31A56",
            });
          }
        });
        setDisabilities(formatData);
        setEmploymentStatusData(fetchEmploymentStatus);
        setTotalFarmer(data.total);
        setTotalSme(data.totalSME);
        setSmeCategoryData(fetchedSmeData);
        setAgeData(fetchedAgeData);
        setEducationLevel(fetchedEducationLevel);
        setLocationData(data.locationDistribution);
        setGenderData(fetchedGenderData);

        const totalEmploymentCount = data.employmentStatusDistribution.reduce(
          (acc: number, item: { count: number }) => acc + item.count,
          0
        );

        // Only count entries where employmentStatus is 1 (employed)
        const totalEmployedCount = data.employmentStatusDistribution
          .filter(
            (item: { employmentStatus: number | null }) =>
              item.employmentStatus === 1
          )
          .reduce(
            (acc: number, item: { count: number }) => acc + item.count,
            0
          );

        const employmentScore = (
          (totalEmployedCount / totalEmploymentCount) *
          100
        ).toFixed(2);

        setEmploymentScore(Number(employmentScore));

        const totalFemaleCount = data.genderDistribution
          .filter((item: { gender: string }) => item.gender === "F")
          .reduce(
            (acc: number, item: { count: number }) => acc + item.count,
            0
          );

        const totalGenderCount = data.genderDistribution.reduce(
          (acc: number, item: { count: number }) => acc + item.count,
          0
        );

        const femaleInclusion = (
          (totalFemaleCount / totalGenderCount) *
          100
        ).toFixed(2);
        setFemaleInclusion(Number(femaleInclusion));
        setTotalFemale(totalFemaleCount);
      }
    } catch (error) {
      // console.error("Error fetching data: ", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const fetchServiceApplicationData = async () => {
    setLoading(true);
    try {
      const params = Object.keys(filters).reduce((acc, key) => {
        const typedKey = key as keyof FilterOptions;
        if (filters[typedKey]) acc[typedKey] = filters[typedKey];
        return acc;
      }, {} as Record<keyof FilterOptions, any>);

      const response = await axios.get(`${baseUrl}/api/v1/application/stats`, {
        headers: { "x-auth-token": token },
        params,
      });

      // Transform API response data to match the expected structure
      const serviceApplications = response.data.data.map((service: any) => ({
        name: service.serviceName,
        Approved: service.approved,
        Pending: service.pending,
        Rejected: service.rejected,
        Requested: service.requested,
      }));

      setServApplicationStatus(serviceApplications);
    } catch (error) {
      console.error("Error fetching service application data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceApplicationData();
    fetchData();
    fetchOrganizations();
    getLocations();
    getMyOrganization();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDateChange = (_dates: any, dateStrings: [string, string]) => {
    const [from, to] = dateStrings;
    setFilters((prevFilters) => ({
      ...prevFilters,
      from,
      to,
    }));
  };

  const handleFilterButtonClick = async () => {
    setLoading(true);
    try {
      const params = Object.keys(filters).reduce((acc, key) => {
        const typedKey = key as keyof FilterOptions;
        if (filters[typedKey]) acc[typedKey] = filters[typedKey];
        return acc;
      }, {} as Record<keyof FilterOptions, any>);

      const response = await axios.get(`${baseUrl}/api/v1/applicants/stats`, {
        headers: { "x-auth-token": token },
        params,
      });

      const data = response.data.data;
      // const { disabilityDistribution } = data;

      if (!data.total) {
        setNoData(true);
      } else {
        setNoData(false);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    try {
      const res = await getOrganizationById(value);
      if (res) {
        const { servicesProvided } = res.data;
        setServices(servicesProvided);
      }
    } catch (error) {
      //
    }
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

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number[],
    requiredOrgType: number[]
  ) => {
    return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
  };

  return (
    <div className="text-gray-600">
      <div className="flex justify-between items-center px-3 w-full font-roboto">
        <div className="p-0">
          <h1 className="text-lg">
            Welcome{" "}
            <span className="font-bold">
              {firstName} {lastName}
            </span>
          </h1>
        </div>
      </div>
      <div className="flex items-center justify-between bg-[#E8E8E8] p-2 mb-4">
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full">
          {hasAccess([], [1, 2], [1]) && (
            <select
              name="orgId"
              value={filters.orgId}
              onChange={(e) => {
                handleFilterChange(e);
                handleOrganizationChange(e);
              }}
              className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
            >
              <option value="">All Partners</option>
              {organizations.map((organization) => (
                <option key={organization._id} value={organization._id}>
                  {organization.name}
                </option>
              ))}
            </select>
          )}
          <select
            name="serviceId"
            value={filters.serviceId}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option value="">Services</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
          <RangePicker
            onChange={handleDateChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-2/4"
          />
          <select
            name="provinceId"
            value={filters.provinceId}
            onChange={(e) => {
              handleFilterChange(e);
              fetchDistricts(e);
            }}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option value="">All Province</option>
            {regionOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            name="districtId"
            value={filters.districtId}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-full md:w-1/4"
          >
            <option value="">All Districts</option>
            {districtOptions.map((district) => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
          </select>
          <Button
            className={`flex items-center rounded-none py-4 w-full md:w-1/4 ${
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
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : noData ? (
        <div className="flex items-center justify-center select-none">
          <div className="w-full max-w-md text-center">
            <img
              src={nodata}
              alt="No Data"
              className="pointer-events-none select-none"
              draggable="false"
            />
            <h1 className="text-3xl font-bold text-gray-800">
              No data available.
            </h1>
            <p className="text-black text-sm font-normal">
              Please apply a filter to see results.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="charts flex flex-col justify-between p-2 w-full gap-2">
              <div className="chart-box w-full border-[#ECF4F0] border-2 rounded">
                <div className="flex flex-col p-2">
                  <h1 className="text-lg font-bold">APPLICANTS</h1>
                  <div className="text-4xl font-extrabold">
                    {totalFarmer || 0}
                  </div>
                </div>
                <hr />
                <div className="flex flex-col md:flex-row justify-between p-3 gap-2">
                  <div className="flex flex-col w-full md:w-[45%] lg:w-[30%]">
                    <h2 className="text-md font-bold">Gender Distribution</h2>
                    <PieChartWithPaddingAngle
                      data={genderDatas}
                      colors={COLORS_GENDER}
                      serviceData={[]}
                    />
                  </div>
                  <div className="flex flex-col w-full md:w-[45%] lg:w-[30%] gap-1">
                    <div className="flex flex-col items-center justify-center border-[#FF69F6] border-2 bg-[#FFF3FE]">
                      <h1 className="text-sm font-semibold">
                        Female 70% Inclusion Goal Status Score
                      </h1>
                      <img
                        src={farmers}
                        alt="Company Logo"
                        className="w-14 h-10"
                      />
                      <div className="text-2xl font-bold">
                        {femaleInclusion !== null
                          ? `${femaleInclusion}%`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-[#874C15] border-2 bg-[#FFF5EB]">
                      <h1 className="text-md font-bold">Employment Score</h1>
                      <img
                        src={handshake}
                        alt="Company Logo"
                        className="w-14 h-27"
                      />
                      <div className="text-2xl font-bold">
                        {employmentScore !== null
                          ? `${employmentScore}%`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full md:w-[45%] lg:w-[30%]">
                    <h2 className="text-sm font-semibold">Age Distribution</h2>
                    <PieChartWithPaddingAngle
                      data={ageDatas}
                      colors={COLORS_AGE}
                      serviceData={[]}
                    />
                  </div>
                </div>
              </div>
              <div className="chart-box p-2 border-2 rounded w-full">
                <h2 className="text-lg font-bold mb-2 mt-2">
                  EMPLOYMENT DISTRIBUTION STATUS
                </h2>
                <BarCharts data={employmentStatusData} colors={COLORS_BARS} />
              </div>
            </div>

            <div className="charts flex flex-col justify-between m-2 w-full bg-[#0C743F] border-2 rounded">
              <div className="w-full bg-white">
                <h2 className="text-lg font-bold my-3">APPLICANTS LOCATION</h2>
              </div>
              <div className="chart-box w-full">
                {/* <ErrorBoundary> */}
                <MapComponent locations={locationData} />
                {/* </ErrorBoundary> */}
              </div>
              <div className="flex flex-col md:flex-row justify-between p-4 w-full gap-2">
                <div className="flex flex-col p-3 w-full md:w-[45%] lg:w-[22%] bg-white">
                  <h1 className="text-lg font-semibold py-1 text-[#70BF44]">
                    APPLICANTS
                  </h1>
                  <div className="text-lg font-semibold">
                    {totalFarmer || 0}
                  </div>
                </div>
                {hasAccess([], [1, 2], [1]) ? (
                  <div className="flex flex-col p-3 w-full md:w-[45%] lg:w-[22%] bg-white">
                    <h1 className="text-lg font-semibold py-1 text-[#70BF44]">
                      PARTNERS
                    </h1>
                    <div className="text-lg font-semibold">
                      {numberOfOrganizations || 0}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <div className="flex flex-col p-3 w-full md:w-[45%] lg:w-[22%] bg-white">
                  <h1 className="text-lg font-semibold py-1 text-[#70BF44]">
                    FEMALE
                  </h1>
                  <div className="text-lg font-semibold">{totalFemale || 0}</div>
                </div>
                <div className="flex flex-col p-3 w-full md:w-[45%] lg:w-[22%] bg-white">
                  <h1 className="text-lg font-semibold py-1 text-[#70BF44]">
                    SME
                  </h1>
                  <div className="text-lg font-semibold">{totalSme || 0}</div>
                </div>
                <div className="flex flex-col p-3 w-full md:w-[45%] lg:w-[22%] bg-white">
                  <h1 className="text-lg font-semibold py-1 text-[#70BF44]">
                    DISABILITIES
                  </h1>
                  <div className="text-lg font-semibold">
                    {disabilitiesScore || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="charts flex flex-col sm:grid sm:grid-cols-3 gap-2">
            <div className="chart-box w-full p-2 border-2 rounded">
              <div className="flex flex-col p-2">
                <h1 className="text-lg font-bold">APPLICANTS CATEGORIES</h1>
              </div>
              <HorizontalBarChart data={smeCategoryDatas} />
            </div>
            <div className="chart-box  p-4 border-2 rounded w-full">
              <h2 className="text-lg font-bold mb-2">
                EDUCATION LEVEL DISTRIBUTION
              </h2>
              <PieChartEducationData
                data={educationLevels}
                colors={COLORS_EDU}
              />
            </div>
            <div className="chart-box p-4 border-2 rounded w-full">
              <h2 className="text-lg font-bold mb-2">
                DISABILITIES DISTRIBUTION
              </h2>
              <PieChartDisabilityData data={disabilitiesData} />
            </div>
          </div>

          <div className="flex mt-2">
            <div className="w-full p-2 border-2 rounded">
              <div className="flex flex-col p-2">
                <h1 className="text-lg font-bold">
                  SERVICES APPLICATIONS STATUS
                </h1>
                <div className="text-4xl font-extrabold"></div>
              </div>
              <ServicesApplicationsChart serviceData={servApplicationStatus} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PieChartWithPaddingAngle: React.FC<Props> = ({ data, colors }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label
        paddingAngle={5}
        // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

const BarCharts: React.FC<{ data: ChartData[]; colors: string[] }> = ({
  data,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="value">
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Bar>
      <Tooltip />
      <Legend layout="horizontal" align="center" verticalAlign="top" />
    </BarChart>
  </ResponsiveContainer>
);

const HorizontalBarChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      layout="horizontal"
      width={500}
      height={300}
      data={data}
      margin={{
        top: 0,
        right: 0,
        left: 35,
        bottom: 5,
      }}
      barSize={60}
    >
      <YAxis type="number" />
      <XAxis type="category" dataKey="name" />
      <CartesianGrid strokeDasharray="3 3" />
      <Bar dataKey="value">
        {data.map((_entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS_BARS[index % COLORS_BARS.length]}
          />
        ))}
      </Bar>
      <Tooltip />
      {/* <Legend /> */}
    </BarChart>
  </ResponsiveContainer>
);

export default Dashboards;
