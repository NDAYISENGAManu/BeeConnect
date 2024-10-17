// utils.ts
import { educationLevel, employmentStatus, businessType, maritalStatus, smeCategory, userTypes, gender, employmentType, enterpriseCategory, landOwnership } from "./globalData";

export const getEducationLevel = (level: number): string => {
  switch (level) {
    case educationLevel.ABANZA:
      return "ABANZA";
    case educationLevel.AYISUMBUNYE:
      return "AYISUMBUNYE";
    case educationLevel.IMYUGA:
      return "IMYUGA";
    case educationLevel.KAMINUZA:
      return "KAMINUZA";
    case educationLevel.NTAYO:
      return "NTAYO";
    default:
      return "-";
  }
};

export const getEmploymentStatus = (status: number): string => {
  switch (status) {
    case employmentStatus.EMPLOYED:
      return "EMPLOYED";
    case employmentStatus.UNEMPLOYED:
      return "UNEMPLOYED";
    default:
      return "-";
  }
};

export const getBusinessType = (type: number): string => {
  switch (type) {
    case businessType.INDIVIDUAL:
      return "INDIVIDUAL";
    case businessType.SME:
      return "SME";
    default:
      return "-";
  }
};

export const getMaritalStatus = (status: number): string => {
  switch (status) {
    case maritalStatus.SINGLE:
      return "SINGLE";
    case maritalStatus.MARRIED:
      return "MARRIED";
    case maritalStatus.DIVORCED:
      return "DIVORCED";
    default:
      return "-";
  }
};

export const getSmeCategory = (category: number): string => {
  switch (category) {
    case smeCategory.INVISCIBLE:
      return "INVISCIBLE";
    case smeCategory.BOOTSTRAPERS:
      return "BOOTSTRAPERS";
    case smeCategory.GAZELLES:
      return "GAZELLES";
    default:
      return "-";
  }
};

export const getEnterpriseCategory = (category: number): string => {
  switch (category) {
    case enterpriseCategory.FORMAL:
      return "FORMAL";
    case enterpriseCategory.INFORMAL:
      return "INFORMAL";
    default:
      return "-";
  }
};

export function getUserType(value: number): string {
  switch (value) {
    case userTypes.ORG_USERS:
      return "ORG_USERS";
    case userTypes.NO_ORG_USERS:
      return "NO_ORG_USERS";
    default:
      return "-";
  }
}

export function getGender(value: string): string {
  switch (value) {
    case gender.FEMALE:
      return "Female";
    case gender.MALE:
      return "Male";
    default:
      return "-";
  }
}

export const getEmploymentType = (status: number): string => {
  switch (status) {
    case employmentType.GOVERNMENT:
      return "GOVERNMENT";
    case employmentType.PRIVATE:
      return "PRIVATE";
    case employmentType.SELF_EMPLOYED:
      return "SELF_EMPLOYED";
    case employmentType.OTHER:
      return "OTHER";
    default:
      return "-";
  }
};

export const getLandOwnershipType = (status: number): string => {
  switch (status) {
    case landOwnership.NUBWANGE:
      return "NUBWANGE";
    case landOwnership.NDABUKODESHA:
      return "NDABUKODESHA";
    case landOwnership.BURAVANZE:
      return "BURAVANZE";
    default:
      return "-";
  }
};
