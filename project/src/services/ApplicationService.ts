import axiosInstance from "./Axios";
import { Application, ApplicationResponse } from "../types/DataTypes";
const BASE_URL = "http://localhost:8080/project1/application";


export const getApplications = async () => {
    const response = await axiosInstance.get<ApplicationResponse[]>(`${BASE_URL}/list`);
    return response.data; // <<< Lấy phần dữ liệu thực sự
};


export const getAllApplications = () =>
  axiosInstance.get<Application[]>(BASE_URL);

export const getApplicationById = (id: string) =>
  axiosInstance.get<Application>(`${BASE_URL}/${id}`);

export const getApplicationByStudentId = (studentId: string) =>
  axiosInstance.get<ApplicationResponse[]>(`${BASE_URL}/list/${studentId}`);

export const getApplicationsByInternship = (internshipId: string) =>
  axiosInstance.get<Application[]>(`${BASE_URL}/internship/${internshipId}`);

export const createApplication = (internshipId: string) =>
  axiosInstance.post(`${BASE_URL}/apply/${internshipId}`);

export const updateApplicationStatus = async (id: string, status: string) => {
  try {
    const response = await axiosInstance.put<Application>(
      `${BASE_URL}/approve/${id}?status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating application status", error);
    throw error;
  }
};


export const deleteApplication = (id: string) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);

export const getApprovedApplications = async () => {
    const response = await axiosInstance.get<ApplicationResponse[]>(`${BASE_URL}/practice`);
    return response.data;
};

export const getStudentApplications = async () => {
  const response = await axiosInstance.get<ApplicationResponse[]>(`${BASE_URL}/approved/list`);
  return response.data;
};
