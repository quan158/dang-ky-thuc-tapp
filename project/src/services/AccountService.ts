import axiosInstance from "./Axios";
import { Account, AccountCreationPayload } from "../types/DataTypes"; // <-- Import AccountCreationPayload

const BASE_URL = "http://localhost:8080/project1/accounts"; // <-- Kiểm tra lại BASE_URL trong Axios.ts

export const getAllAccounts = () => axiosInstance.get<Account[]>(`${BASE_URL}/list`);
export const getAccountById = (id: string) =>
  axiosInstance.get<Account>(`${BASE_URL}/${id}`);

// Cập nhật kiểu dữ liệu tham số cho createAccount
export const createAccount = (data: AccountCreationPayload) =>
  axiosInstance.post<Account>(BASE_URL, data); 

export const updateAccount = (id: string, data: Partial<AccountCreationPayload>) =>
  axiosInstance.put<Account>(`${BASE_URL}/${id}`, data); 

export const deleteAccount = (id: string) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);

export const getAccountByUsername = () =>
  axiosInstance.get<Account>(`${BASE_URL}/myInfo`);

