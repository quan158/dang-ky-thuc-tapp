import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createInternship } from "../../../services/InternshipService"; // Import the create service function
import { InternshipCreationPayload } from "../../../types/DataTypes"; // Import the new payload type
import axios from "axios"; // Import axios for detailed error handling

const InternshipCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

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

    // Construct the payload based on InternshipRequest.java
    // Use the new InternshipCreationPayload type
    const internshipPayload: InternshipCreationPayload = {
      position,
      description,
      requirement,
      benefits,
      recruitmentQuantity,
      // companyID is intentionally excluded here, matching InternshipRequest.java
    };

    try {
      setLoading(true); // Start loading
      // Call the createInternship service with the payload
      await createInternship(internshipPayload); // This now expects InternshipCreationPayload

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Internship created successfully!",
      }).then(() => navigate("/manager/internship/list")); // Navigate to the list page on success

    } catch (err) {
      console.error("Error creating internship:", err); // Log the full error

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
                   "Bạn không có quyền tạo đợt thực tập hoặc phiên đăng nhập đã hết hạn.",
                   "error"
               );
          } else if (err.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              Swal.fire(
                  "Lỗi!",
                  `Tạo đợt thực tập không thành công: Máy chủ phản hồi trạng thái ${err.response.status}.`,
                  "error"
              );
          } else if (err.request) {
              // The request was made but no response was received
              Swal.fire(
                  "Lỗi!",
                  "Tạo đợt thực tập không thành công: Không nhận được phản hồi từ máy chủ. Backend có đang chạy không?",
                  "error"
              );
          } else {
              // Something happened in setting up the request that triggered an Error
              Swal.fire(
                  "Lỗi!",
                  `Tạo đợt thực tập không thành công: Đã xảy ra lỗi bất ngờ - ${err.message}`,
                  "error"
              );
          }
      } else {
           // Handle non-Axios errors
           Swal.fire(
               "Lỗi!",
               `Tạo đợt thực tập không thành công: Đã xảy ra lỗi bất ngờ - ${err}`,
               "error"
           );
      }
    } finally {
        setLoading(false); // End loading
    }
  };

  return (
    <div id="InternshipCreate" className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Create New Internship</h4>
            {/* Form for creating a new internship */}
            <form className="forms-sample" onSubmit={handleSubmit}>
              {/* Position */}
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  className="form-control"
                  id="position"
                  name="position"
                  placeholder="Enter position"
                  required // Make this field required
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
                  placeholder="Enter recruitment quantity"
                  required // Make this field required
                  min="1" // Minimum quantity should be 1
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Enter description"
                  required // Make this field required
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
                  placeholder="Enter requirements"
                  required // Make this field required
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
                  placeholder="Enter benefits"
                  required // Make this field required
                />
              </div>

              {/* Submit and Cancel Buttons */}
              <button type="submit" className="btn btn-primary mr-2" disabled={loading}>
                {loading ? "Creating..." : "Submit"} {/* Show loading text */}
              </button>
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

export default InternshipCreate;
