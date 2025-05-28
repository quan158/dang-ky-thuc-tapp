import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// Removed Select import as it's not needed for details/update modes
// Removed fetchCompanyFilterOptions, fetchMajorFilterOptions imports

import {
  updateInternship,
  getInternshipById, // Use the service function that fetches a single internship
} from "../../../services/InternshipService"; // Corrected import path and function names
import { Internship, InternshipCreationPayload } from "../../../types/DataTypes"; // Import Internship and InternshipCreationPayload types
import axios from "axios"; // Import axios for detailed error handling

// Define the interface for the props that InternshipDetails component accepts
interface InternshipDetailsProps {
    mode: "details" | "update"; // The mode prop can only be 'details' or 'update'
}

// Update the component signature to use the defined props interface
const InternshipDetails: React.FC<InternshipDetailsProps> = ({ mode }) => {
  // Get internshipId from URL parameters
  const { internshipId } = useParams<{ internshipId: string }>();
  const navigate = useNavigate();

  // State to hold internship data
  const [internship, setInternship] = useState<Internship | null>(null);
  // Removed states for companies, majors, selectedCompany, selectedMajor

  // State for loading and error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the current mode based on the prop
  const isUpdateMode = mode === "update";
  const isDetailsMode = mode === "details";
  // isCreateMode is not handled by this component

  // Effect hook to fetch internship details if in update/details mode and internshipId is available
  useEffect(() => {
    // Only fetch details if internshipId is present and in a relevant mode
    if (internshipId && (isDetailsMode || isUpdateMode)) {
      fetchInternshipDetails(internshipId);
    } else {
       // Handle cases where mode is invalid or internshipId is missing in update/details mode
       // This case should ideally not be hit if routing is correct, but good for safety
       setError("Invalid mode or missing Internship ID.");
       setLoading(false);
    }
  }, [internshipId, isDetailsMode, isUpdateMode]); // Dependencies for the effect

  // Function to fetch internship details by ID
  const fetchInternshipDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      // Call the service function to get internship details
      const response = await getInternshipById(id); // Get the full AxiosResponse
      const data = response.data; // Access the data property

      if (data) {
        setInternship(data);
        // We don't need to set selectedCompany/Major states as they are not form fields here
        // The company name will be displayed directly from the fetched internship object
      } else {
         setError("Internship details not found.");
      }
    } catch (err) { // Changed error variable name to err for consistency
      console.error("Failed to fetch internship details:", err); // Log the error object

      // Add more specific error logging based on the error type
      if (axios.isAxiosError(err)) {
          console.error("Axios error details:", {
              message: err.message,
              code: err.code,
              status: err.response?.status,
              statusText: err.response?.statusText,
              data: err.response?.data,
              config: err.config,
          });
          if (err.response?.status === 404) {
               setError("Internship not found.");
          } else if (err.response?.status === 401 || err.response?.status === 403) {
               setError("Authentication or authorization failed. Please log in again or check your permissions.");
          } else if (err.response) {
              setError(`Failed to fetch internship details: Server responded with status ${err.response.status}`);
          } else if (err.request) {
              setError("Failed to fetch internship details: No response received from server. Is the backend running?");
          } else {
              setError(`Failed to fetch internship details: ${err.message}`);
          }
      } else {
          setError(`Failed to fetch internship details: An unexpected error occurred - ${err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchFilters function

  // Function to handle form submission (only update mode)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // This component only handles update, so we only proceed if in update mode and have an internshipId
    if (!isUpdateMode || !internshipId) {
        console.warn("Attempted to submit form in incorrect mode or without internship ID.");
        return;
    }

    const form = e.target as HTMLFormElement;
    // Extract form values by name
    const position = (form.elements.namedItem("position") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const requirement = (form.elements.namedItem("requirement") as HTMLTextAreaElement).value;
    const benefits = (form.elements.namedItem("benefits") as HTMLTextAreaElement).value;
    const recruitmentQuantity = parseInt((form.elements.namedItem("recruitmentQuantity") as HTMLInputElement).value, 10); // Parse as integer

     // Basic validation
     if (!position || !description || !requirement || !benefits || recruitmentQuantity < 1) {
         Swal.fire("Validation Error", "Please fill in all required fields and ensure Recruitment Quantity is at least 1.", "warning");
         return;
     }

    // Construct the payload for the backend update endpoint
    // This payload should match InternshipRequest.java
    const internshipPayload: InternshipCreationPayload = { // Use InternshipCreationPayload as it matches InternshipRequest
      position,
      description,
      requirement,
      benefits,
      recruitmentQuantity,
      // companyID is NOT included here, as the backend update endpoint doesn't expect it in the body
    };

    try {
      setLoading(true); // Start loading for update
      // Call the update service with the internship ID (string) and payload
      await updateInternship(internshipId, internshipPayload);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Internship updated successfully!",
      }).then(() => navigate(`/manager/internship/details/${internshipId}`)); // Navigate to details after update

    } catch (err) { // Changed error variable name to err for consistency
      console.error("Update failed:", err); // Log the full error

      // Enhanced error handling for user feedback
      if (axios.isAxiosError(err)) {
          console.error("Axios error details:", {
              message: err.message,
              code: err.code,
              status: err.response?.status,
              statusText: err.response?.statusText,
              data: err.response?.data,
              config: err.config,
          });
           if (err.response?.status === 401 || err.response?.status === 403) {
               Swal.fire(
                   "Lỗi!",
                   "Bạn không có quyền cập nhật đợt thực tập này hoặc phiên đăng nhập đã hết hạn.",
                   "error"
               );
          } else if (err.response?.status === 404) {
               Swal.fire("Lỗi!", "Không tìm thấy đợt thực tập để cập nhật.", "error");
          }
          else if (err.response) {
              Swal.fire(
                  "Lỗi!",
                  `Cập nhật không thành công: Máy chủ phản hồi trạng thái ${err.response.status}.`,
                  "error"
              );
          } else if (err.request) {
              Swal.fire(
                  "Lỗi!",
                  "Cập nhật không thành công: Không nhận được phản hồi từ máy chủ. Backend có đang chạy không?",
                  "error"
              );
          } else {
              Swal.fire(
                  "Lỗi!",
                  `Cập nhật không thành công: Đã xảy ra lỗi bất ngờ - ${err.message}`,
                  "error"
              );
          }
      } else {
           Swal.fire(
               "Lỗi!",
               `Cập nhật không thành công: Đã xảy ra lỗi bất ngờ - ${err}`,
               "error"
           );
      }
    } finally {
        setLoading(false); // End loading for update
    }
  };

  const handleUpdateClick = () => {
    navigate(`/manager/internship/update/${internshipId}`);
  };

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render error state
  if (error) {
      return <p className="text-danger">{error}</p>;
  }

  // Render the form/details view
  return (
    <div id="InternshipDetail" className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            {/* Title based on mode */}
            <h4 className="card-title">
              {isUpdateMode
                ? "Update Internship"
                : "View Internship Details"} {/* Only Details or Update */}
            </h4>

            {/* Form - used for both displaying details (disabled) and updating */}
            <form className="forms-sample" onSubmit={handleSubmit}>
              {/* Position */}
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  className="form-control"
                  id="position"
                  name="position"
                  defaultValue={internship?.position || ""}
                  disabled={isDetailsMode} // Disable in details mode
                  required
                />
              </div>

              {/* Recruitment Quantity */}
              <div className="form-group">
                <label htmlFor="recruitmentQuantity">Recruitment Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  id="recruitmentQuantity"
                  name="recruitmentQuantity"
                  defaultValue={internship?.recruitmentQuantity || 0}
                  disabled={isDetailsMode} // Disable in details mode
                  required
                  min="1"
                />
              </div>

              {/* Removed Company Select */}
              {/* Removed Major Select */}


              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={internship?.description || ""}
                  disabled={isDetailsMode} // Disable in details mode
                  required
                />
              </div>
              {/* Requirement */}
              <div className="form-group">
                <label htmlFor="requirement">Requirement</label>
                <textarea
                  className="form-control"
                  id="requirement"
                  name="requirement"
                  rows={4}
                  defaultValue={internship?.requirement || ""}
                  disabled={isDetailsMode} // Disable in details mode
                  required
                />
              </div>
              {/* Benefits */}
              <div className="form-group">
                <label htmlFor="benefits">Benefits</label>
                <textarea
                  className="form-control"
                  id="benefits"
                  name="benefits"
                  rows={4}
                  defaultValue={internship?.benefits || ""}
                  disabled={isDetailsMode} // Disable in details mode
                  required
                />
              </div>

              {/* Action Buttons */}
              {isUpdateMode ? (
                // Update button in update mode
                <button type="submit" className="btn btn-primary mr-2" disabled={loading}>
                  {loading ? "Updating..." : "Update"} {/* Show loading text */}
                </button>
              ) : isDetailsMode ? ( // Show Edit button in details mode
                <button
                  type="button"
                  className="btn btn-primary mr-2"
                  onClick={handleUpdateClick} // Call handleUpdateClick
                >
                  Edit
                </button>
              ) : null /* No buttons in other modes (shouldn't happen with current logic) */}
              {/* Cancel button - navigates back */}
              <button
                className="btn btn-light"
                type="button"
                onClick={() => navigate(-1)} // Navigate back
                disabled={loading} // Disable while loading
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetails;
