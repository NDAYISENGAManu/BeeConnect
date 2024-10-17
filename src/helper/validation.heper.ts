import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../types/globalData";

export const formatPhone = (phoneNumber?: string) => {
  if (!phoneNumber) return undefined;

  let phone = phoneNumber
    ?.trim()
    .replace(/[^0-9+]/g, '');

  if (phone.startsWith('+')) {
    phone = phone.slice(1);
  }

  if (phone.startsWith('250')) {
    phone = phone.slice(3);
  }

  if (phone.startsWith('07')) {
    phone = '250' + phone.slice(1);
  } else if (phone.startsWith('7') || phone.startsWith('8')) {
    phone = '250' + phone;
  } else if (phone.startsWith('0')) {
    phone = '25' + phone.slice(1);
  }

  if (/^2507[2,3,8,9]\d{7}$/.test(phone)) {
    return phone;
  } else {
    return undefined;
  }
};

export const isTokenValid=():boolean=>{
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  const {exp } = jwtDecode<DecodedToken>(token);
  const expirationTime = exp * 1000; 
  if (!token || !expirationTime) {
    return false;
  }
  const currentTime = Date.now();
  return currentTime < expirationTime;
}


