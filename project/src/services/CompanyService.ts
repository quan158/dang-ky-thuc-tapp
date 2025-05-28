import { Company } from "../types/DataTypes";
import axiosInstance from "./Axios";

const BASE_URL = "/company";

// Nếu backend trả paginated response:
interface PaginatedCompanyResponse {
    items: Company[];
    totalPages: number;
    totalItems?: number;
}

// Hàm lấy danh sách công ty có phân trang (nếu backend hỗ trợ)
export const getAllCompanies = async (): Promise<PaginatedCompanyResponse> => {
    try {
        const response = await axiosInstance.get<PaginatedCompanyResponse>(`${BASE_URL}/list`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all companies in service:", error);
        throw error;
    }
};

export const getCompanyById = async (id: string) => {
    try {
        const response = await axiosInstance.get<Company>(`${BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error in getCompanyById service:", error);
        throw error; // Re-throw để component có thể xử lý
    }
};

export const getMyCompany = () =>
    axiosInstance.get<Company>(`${BASE_URL}/profile`);

export const createCompany = (data: Omit<Company, "companyID">) =>
    axiosInstance.post<Company>(BASE_URL, data);

export const updateCompany = (id: string, data: Partial<Company>) =>
    axiosInstance.put<Company>(`${BASE_URL}/${id}`, data);

export const deleteCompany = (id: string) =>
    axiosInstance.delete(`${BASE_URL}/${id}`);

export const uploadAvatar = async (companyId: string, file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file); // Đảm bảo backend nhận param tên 'file'

        const response = await axiosInstance.post<string>(`${BASE_URL}/${companyId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading avatar in service:", error);
        throw error;
    }
};
