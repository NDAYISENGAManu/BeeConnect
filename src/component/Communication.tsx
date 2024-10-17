import React from "react";
import { Table, Space, Button } from "antd";
import { ColumnsType } from "antd/es/table";
import { EditOutlined, EyeOutlined, FilterOutlined } from "@ant-design/icons";

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

const data: Communication[] = [
  {
    key: "1",
    date: "2023-06-18",
    farmerName: "Farmer A",
    FarmerContacts: "0789528764",
    FarmerLocation: "Location A",
    EducationLevel: "License A",
    CommunicationRequested: "Communication A",
    status: "Active",
  },
  {
    key: "2",
    date: "2023-06-18",
    farmerName: "Farmer B",
    FarmerContacts: "0789528764",
    FarmerLocation: "Location B",
    EducationLevel: "License B",
    CommunicationRequested: "Communication B",
    status: "Active",
  },
  {
    key: "3",
    date: "2023-06-18",
    farmerName: "Farmer C",
    FarmerContacts: "0789528764",
    FarmerLocation: "Location C",
    EducationLevel: "License C",
    CommunicationRequested: "Communication C",
    status: "Active",
  },
];

const Farmers: React.FC = () => {
  const columns: ColumnsType<Communication> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Farmer Name",
      dataIndex: "farmerName",
      key: "farmerName",
    },
    {
      title: "Farmer Contacts",
      dataIndex: "FarmerContacts",
      key: "FarmerContacts",
    },
    {
      title: "Farmer Location",
      dataIndex: "FarmerLocation",
      key: "FarmerLocation",
    },
    {
      title: "Education Level",
      dataIndex: "EducationLevel",
      key: "EducationLevel",
    },
    {
      title: "Communication Requested",
      dataIndex: "CommunicationRequested",
      key: "CommunicationRequested",
    },
    {
      title: "Job Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={
            status === "Active"
              ? "status-active"
              : status === "Inactive"
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
      render: () => (
        <Space size="middle" className="gap-1">
          <Button
            className="text-[#0C743F] border-1 rounded-none"
            icon={<EyeOutlined className="text-[#0C743F]" />}
            size="small"
          />
          <Button
            className="text-[#FFA928] border-1 rounded-none"
            icon={<EditOutlined className="text-[#FFA928]" />}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          <span>Communication</span>
        </h2>
      </div>
      <div className="flex flex-col w-full md:flex-row md:justify-between gap-3 bg-[#ECF4F0] p-8 mb-5">
        <div className="flex flex-col w-full bg-white pt-2">
          <h2 className="text-[#0C743F] text-lg font-bold">SMS BOUGHT</h2>
          <p className="text-3xl font-extrabold">0000</p>
        </div>
        <div className="flex flex-col w-full bg-white pt-2">
          <h2 className="text-[#0C743F] text-lg font-bold">SMS REMAINING</h2>
          <p className="text-3xl font-extrabold">0000</p>
        </div>
        <div className="flex flex-col w-full justify-between bg-white p-2">
          <h2 className="text-[#0C743F] text-lg font-bold">SMS ACTIVITIES</h2>
          <div className="flex gap-2">
            <div className="flex flex-col w-full bg-[#B7E9BC] items-center pt-2">
              <h2 className="text-[#0C743F] text-md font-bold">SENT</h2>
              <p className="text-lg font-extrabold">00</p>
            </div>
            <div className="flex flex-col w-full bg-[#FF000012] items-center pt-2">
              <h2 className="text-[#FF0000] text-md font-bold">FAILED</h2>
              <p className="text-lg font-extrabold">00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#E8E8E8] p-2 mb-4">
        <div className="flex items-center space-x-2 w-full">
          {" "}
          <select className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-1/4">
            <option value="Select by Communication">
              Select by Communication
            </option>
            <option value="Communication 1">Communication 1</option>
            <option value="Communication 2">Communication 2</option>
          </select>
          <select className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-1/4">
            <option value="Select by Status">Select by Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-1/4">
            <option value="Select by Month">Select by Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
          </select>
          <Button className="bg-[#B1B1B1] text-white flex items-center rounded-none py-4 w-1/4">
            {" "}
            <span className="mr-1">
              {" "}
              <FilterOutlined />
            </span>
            Filter
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between my-4">
        <h2 className="text-md font-normal">Showing 1 to 10 of 300 entries</h2>
        <div className="flex items-center">
          <label htmlFor="simple-search" className="font-normal w-full">
            Quick Search
          </label>
          <div className="relative w-full">
            <input
              type="text"
              id="simple-search"
              className="bg-white border-2 border-black text-gray-900 text-sm rounded-md block w-full p-2"
              required
            />
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 15 }}
      />
      <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
    </>
  );
};

export default Farmers;
