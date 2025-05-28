import axiosInstance from "./Axios";
import { Internship, InternshipCreationPayload } from "../types/DataTypes";

// Sử dụng BASE_URL tương đối như trong các service khác
const BASE_URL = "http://localhost:8080/project1/internship";

// Modified function to fetch internships with pagination and keyword filter
export const fetchInternships = async (keyword?: string): Promise<Internship[]> => {
  try {
    const response = await axiosInstance.get<Internship[]>(
      keyword ? `${BASE_URL}?keyword=${encodeURIComponent(keyword)}` : `${BASE_URL}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching internships:", error);
    throw error;
  }
};

// Existing function to get a single internship by ID
export const getInternshipById = (id: string) =>
  axiosInstance.get<Internship>(`${BASE_URL}/${id}`);

export const getInternshipsByCompany = () => {
  return axiosInstance.get(`/internship/list`);
};

export const getInternshipsByCompanyId = (companyId: string) => {
  return axiosInstance.get(`/internship/list/${companyId}`);
};

export const getInternshipsByCompanyIdAndStatus = (companyId: string) => {
  return axiosInstance.get(`/internship/list/${companyId}/approved`);
};

// Existing function to create an internship
export const createInternship = (data: InternshipCreationPayload) => // Use InternshipCreationPayload
  axiosInstance.post<Internship>(BASE_URL, data);

// Existing function to update an internship
export const updateInternship = (id: string, data: Partial<Internship>) =>
  axiosInstance.put<Internship>(`${BASE_URL}/${id}`, data);

// Existing function to delete an internship
export const deleteInternship = (id: string) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);

// Cập nhật trạng thái thực tập (Duyệt hoặc Từ chối)
export const updateInternshipStatus = (internshipID: string, status: string) => {
  return axiosInstance.put(`${BASE_URL}/approved/${internshipID}`, null, {
    params: { status },
  });
};
