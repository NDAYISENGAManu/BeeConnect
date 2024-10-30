/* eslint-disable @typescript-eslint/no-explicit-any */
// globalData.ts
export interface PartnersType {
  _id: string;
  name: string;
  type: number;
  description: string;
  website: string;
  email: string;
  phoneNumber: string;
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
  };
  adminInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
  };
  coveredDistricts?: {
    _id: string;
    name: string;
  }[];
  servicesProvided?: {
    _id: string;
    name: string;
  }[];
  tinNumber?: string;
}

export interface ServiceType {
  key: string;
  date: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  requiresLandInfo: string;
  status: string;
}

export interface CustomError extends Error {
  status?: number;
}

export interface Policy {
  _id: string;
  orgType: number;
  role: number;
  accesses: string[];
}

export interface Users {
  key: string;
  date: string;
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  phoneNumber: string;
  organization: string;
  role: string;
  userType: string;
  gender: string;
}

export interface ServiceApplications {
  key: string;
  date: string;
  serviceName: string;
  organizationName: string;
  userName: string;
  educationLevel: string;
  approvalStatus: number;
  phoneNumber?: string;
  knowledgeLevel?: string;
  businessType?: number;
  smeCategory?: number;
  location?: string;
  locationDetails?: {
    province: string;
    district: string;
    sector: string;
  };
  rejectionReason?: string;
  approvedBy?: {
    id: string;
    name: string;
    when: string;
  };
}

export interface Location {
  province: { name: string };
  district: { name: string };
  sector: { name: string };
}

export interface ApiResponse {
  status: number;
  message: string;
  data: Application[];
  timestamp: string;
}
export interface Farmer {
  enterpriseName?: string;
  _id: string;
  key: string;
  date: string;
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  phoneNumber: string;
  userType: number;
  educationLevel: number;
  businessType: number;
  employmentStatus: number;
  location: {
    province: {
      [x: string]: any;
      name: string;
    };
    district: {
      [x: string]: any;
      name: string;
    };
    sector: {
      [x: string]: any;
      name: string;
    };
  };
  enterprise: {
      [x: string]: any;
      name: string;
    };
  smeCategory: number;
  dateOfBirth: string;
  age: number;
  gender: string;
  maritalStatus: number;
  hasDisability: string;
  isARefugee: string;
  isActiveStudent: string;
  employmentType: number;
  landSize?: number;
}

export interface Application {
  key: string;
  date: string;
  type?: number;
  service: {
    _id: string;
    name: string;
  };
  userId: User | null;
  organization: {
    _id: string;
    name: string;
  };
  serviceName: string;
  organizationName: string;
  userName: string;
  educationLevel: string;
  approvalStatus: number;
  phoneNumber?: string;
  knowledgeLevel?: string;
  businessType?: number;
  smeCategory?: number;
  location?: string;
  locationDetails?: {
    province: string;
    district: string;
    sector: string;
  };
  totalLandSizeOwned: string;
  totalLandSizeAccessed: string;
  landOwnership: string;
  landSize?: number;
  enterprise?: {
    _id: string;
    name: string;
  };
  transferredBy?: {
    id: string;
    name: string;
    when: string;
  };
  transferredFrom?: {
    id: string;
    name: string;
  };
  transferReason?: string;
  rejectionReason?: string;
  approvedBy?: {
    id: string;
    name: string;
    when: string;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  educationLevel: number;
  businessType?: number;
  smeCategory?: number;
}

export interface Organization {
  _id: string;
  name: string;
}

export enum smeCategory {
  INVISCIBLE = 1,
  BOOTSTRAPERS=2,
  GAZELLES=3
}

export enum enterpriseCategory {
  FORMAL = 1,
  INFORMAL=2,
}

export enum userRoles {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  NORMAL_USER,
}
export enum userTypes {
  ORG_USERS = 1,
  NO_ORG_USERS,
}
export enum geoMapType {
  PROVINCE = 1,
  DISTRICT = 2,
  SECTOR = 3,
}

export enum educationLevel {
  PRIMARY = 1,
  SECONDARY = 2,
  TVET = 3,
  UNIVERSITY = 4,
  NONE=5
}

export enum employmentStatus {
  EMPLOYED = 1, 
  UNEMPLOYED = 2,
}
export enum gender {
  FEMALE = "F",
  MALE = "M",
}
export enum paymentMethods {
  MOMO,
  CASH,
}

export enum orgTypes {
  AGRA = 1,
  PARTNER = 2,
}
export enum approvalStatus {
  REJECTED = 1,
  PENDING = 2,
  APPROVED = 3,
}
export enum serviceStatus {
  REJECTED = 1,
  PENDING = 2,
  APPROVED = 3,
}
export enum maritalStatus {
  SINGLE = 1,
  MARRIED = 2,
  DIVORCED = 3,
}
export enum applicationTypes {
  SELF_APPLICATION = 1,
  TRANSFERRED_APPLICATION
}
export enum knowledgeLevel{
  NOT_EXPERIENCED=1,
  BASIC_KNOWLEDGE=2,
  EXPERIENCED=3
}
export enum businessType {
  INDIVIDUAL = 1,
  SME = 2,
}

export enum employmentType {
  GOVERNMENT = 1,
  PRIVATE=2 ,
  SELF_EMPLOYED=3 ,
  OTHER=100
}

export enum landOwnership {
  NUBWANGE = 1,
  NDABUKODESHA = 2,
  BURAVANZE = 3,
}

export interface Partner {
  _id: string;
  name: string;
  type: number;
  description: string;
  website: string;
  email: string;
  phoneNumber: string;
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
  };
  adminInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
  };
  coveredDistricts?: {
    _id: string;
    name: string;
  }[];
  servicesProvided?: {
    _id: string;
    name: string;
  }[];
  tinNumber?: string;
}

export interface DecodedToken {
  exp: number;
}

export interface MapLocations {
  districts: {
    sectors: {
      id: number,
      name: string, 
      _id: string, 
      type: number
      parentId: number
    },
    id: number,
    name: string, 
    _id: string, 
    type: number, 
    parentId: number
  }[],
  id: number,
  name: string, 
  _id: string, 
  type: number
}

export interface OrganizationServices {
  _id: string;
  name: string;
} 

export interface EnterpriseTypes {
  _id: any;
  name: string;
  tinNumber: string;
  type: number;
  totalYouthEmployed: number;
  noOfYouthRefugees: number;
  noOfYouthIDPs: number;
  noOfYouthPLWDs: number;
  smeCategory: number;
  ownerNationalId: string;
  subPartners?: string;
}

export interface EnterpriseEditTypes {
  key:any;
  _id: any;
  name: string;
  tinNumber: string;
  type: number;
  totalYouthEmployed: number;
  noOfYouthRefugees: number;
  noOfYouthIDPs: number;
  noOfYouthPLWDs: number;
  smeCategory: number;
  owner:{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nationalId: number;
  };
  subPartners?: string;
}
