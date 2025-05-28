import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import {
  getInternshipsByCompany,
  deleteInternship,
} from "../../../services/InternshipService"; // Corrected import path and function names
import { Internship } from "../../../types/DataTypes"; // Corrected import path
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios"; // Import axios to check for Axios errors

const InternshipListForCompany: React.FC = () => {
  // State for internship data, loading, and error
  const [internshipData, setInternshipData] = useState<Internship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Function to fetch internship data using getInternshipsByCompany
  const fetchInternshipsForCompany = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      // Call the getInternshipsByCompany service.
      // This function is expected to return a direct array of Internship objects.
      const response = await getInternshipsByCompany(); // Get the full AxiosResponse
      const data = response.data; // Access the data property

      // Check if the received data is an array
      if (data && Array.isArray(data)) {
        setInternshipData(data);
        // No pagination, so totalPages can be considered 1 for simple display purposes,
        // or you can remove pagination UI entirely.
        // setTotalPages(1); // Removed totalPages state
      } else {
        // Handle any other unexpected data format
        console.error("Unexpected data format from getInternshipsByCompany:", data);
        throw new Error("Invalid data format received.");
      }
    } catch (err) {
      console.error("Error fetching internships:", err); // Log the error object

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
          if (err.response?.status === 401 || err.response?.status === 403) {
               setError("Authentication or authorization failed. Please log in again or check your permissions.");
          } else if (err.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              setError(`Failed to fetch internships: Server responded with status ${err.response.status}`);
          } else if (err.request) {
              // The request was made but no response was received
              setError("Failed to fetch internships: No response received from server. Is the backend running?");
          } else {
              // Something happened in setting up the request that triggered an Error
              setError(`Failed to fetch internships: ${err.message}`);
          }
      } else {
          // Handle non-Axios errors
          setError(`Failed to fetch internships: An unexpected error occurred - ${err}`);
      }

    } finally {
      setLoading(false);
    }
  };

  // Function to handle internship deletion
  const handleDelete = async (id: string) => { // ID is string
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Dữ liệu sẽ không thể phục hồi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, hãy xóa nó!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteInternship(id);
          Swal.fire("Đã xóa!", "Thông tin thực tập đã được xóa.", "success");
          fetchInternshipsForCompany();
        } catch (error) {
          console.error("Error deleting internship:", error);
          Swal.fire(
            "Lỗi!",
            "Xóa thông tin thực tập không thành công.",
            "error"
          );
        }
      }
    });
  };

  // Effect hook to fetch internship data on component mount
  useEffect(() => {
    fetchInternshipsForCompany();
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <div id="Internship-List" className="row">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Internship List</h4>
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <div></div>
              {/* Removed Search Input and Button */}
              <div> {/* Container for Add New button - this is already on the right */}
                <Button
                  className="btn btn-primary"
                  onClick={() => navigate("/manager/internship/create")}
                >
                  Add New
                </Button>
              </div>
            </div>

            {loading ? (
              <p>Loading internships...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                {internshipData.length > 0 ? (
                  <div className="table-responsive pt-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Vị trí</th>
                          <th>Số lượng tuyển</th>
                          <th>Mô tả</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {internshipData.map((internship, index) => (
                          <tr key={internship.internshipID}>
                            <td>{index + 1}</td>
                            <td>{truncateText(internship.position, 20)}</td>
                            <td>{internship.recruitmentQuantity}</td>
                            <td>{truncateText(internship.description, 50)}</td>
                            <td>
                              <Link to={`/manager/internship/details/${internship.internshipID}`}>
                                <Button className="btn btn-inverse-info btn-icon me-3" title="Xem">
                                  <i className="ti-eye"></i>
                                </Button>
                              </Link>
                              <Button
                                className="btn btn-inverse-danger btn-icon"
                                title="Xóa"
                                onClick={() => handleDelete(internship.internshipID)}
                              >
                                <i className="ti-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-warning">No internships available.</p>
                )}
              </>
            )}
            {/* Removed Pagination component */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipListForCompany;
