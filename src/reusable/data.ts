/* eslint-disable @typescript-eslint/no-explicit-any */
export const toastSuccessStyles = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  export const errorToastConfig = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    type: "error" as const,
  };

export const applicantsSource = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    sorter: (a:any, b:any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: 'First Name',
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: 'Last Name',
    dataIndex: 'lastName',
    key: 'lastName',
  },
  { 
    title: "National ID", 
    dataIndex: "nationalId", 
    key: "nationalId" },
  { 
    title: "Phone Number", 
    dataIndex: "phoneNumber", 
    key: "phoneNumber" 
  },
  {
    title: "Education Level",
    dataIndex: "education",
    key: "educationLevel",
  },
  {
    title: "Business Type",
    dataIndex: "businesstype",
    key: "businessType",
  },
  {
    title: "Employment Status",
    dataIndex: "employment",
    key: "employmentStatus",
  },
  {
    title: "SME Category",
    dataIndex: "sme",
    key: "smeCategory",
  },
  {
    title: "Marital Status",
    dataIndex: "maritalstatus",
    key: "maritalStatus",
  },
  {
    title:'Gender',
    dataIndex: 'gender', 
    key:'gender'
  },
];

export const employmentSource = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    sorter: (a:any, b:any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: 'First Name',
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: 'Last Name',
    dataIndex: 'lastName',
    key: 'lastName',
  },
  { 
    title: "National ID", 
    dataIndex: "nationalId", 
    key: "nationalId" },
  { 
    title: "Phone Number", 
    dataIndex: "phoneNumber", 
    key: "phoneNumber" 
  },
  {
    title: "Education Level",
    dataIndex: "education",
    key: "educationLevel",
  },
  {
    title: "Business Type",
    dataIndex: "businesstype",
    key: "businessType",
  },
  {
    title: "Employment Status",
    dataIndex: "employment",
    key: "employmentStatus",
  },
  {
    title: "SME Category",
    dataIndex: "sme",
    key: "smeCategory",
  },
  {
    title: "Marital Status",
    dataIndex: "maritalstatus",
    key: "maritalStatus",
  },
  {
    title:'Gender',
    dataIndex: 'gender', 
    key:'gender'
  },
];