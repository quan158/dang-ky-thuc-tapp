import axiosInstance from "./Axios";
import { Student } from "../types/DataTypes";

const BASE_URL = "/student";

export const getAllStudents = () => axiosInstance.get<Student[]>(BASE_URL);

export const getStudentById = (id: string) =>
  axiosInstance.get<Student>(`${BASE_URL}/${id}`);

export const getStudentByAccountId = (accountId: string) =>
  axiosInstance.get<Student>(`${BASE_URL}/account/${accountId}`);

export const createStudent = (data: Omit<Student, "studentID" | "createAt" | "accountId">) =>
  axiosInstance.post<Student>(BASE_URL, data);

export const updateStudent = (id: string, data: Partial<Student>) =>
  axiosInstance.put<Student>(`${BASE_URL}/${id}`, data);

export const uploadCv = (studentId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post(`${BASE_URL}/${studentId}/upload-cv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteStudent = (id: string) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
