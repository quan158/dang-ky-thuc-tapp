const BASE_URL = "/proposal";

import axiosInstance from "./Axios";
import { Proposal } from "../types/DataTypes";


export const getAllProposals = () => axiosInstance.get<Proposal[]>(`${BASE_URL}/list`);

export const getProposalById = (id: string) =>
  axiosInstance.get<Proposal>(`${BASE_URL}/${id}`);

export const getProposalsByStudent = () =>
  axiosInstance.get<Proposal[]>(`${BASE_URL}/myProposal`);

export const createProposal = (data: Omit<Proposal, "proposalID">) =>
  axiosInstance.post<Proposal>(BASE_URL, data);

export const updateProposalStatus = async (proposalId: string, status: string) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/${proposalId}/status`,
      null,  
      { params: { status } } 
    );
    return response.data;
  } catch (error) {
    console.error("Error updating status:", error);
    throw new Error('Failed to update status');
  }
};


export const deleteProposal = (id: string) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
