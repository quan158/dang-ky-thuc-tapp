import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import Swal from "sweetalert2";
import axios from "axios"; // Import axios for detailed error handling

import { Company } from "../../../types/DataTypes"; // Import Company interface
import { getMyCompany, updateCompany, uploadAvatar } from "../../../services/CompanyService"; // Import service functions, including uploadAvatar

// Định nghĩa URL cơ sở của backend (chỉ host và port)
const BACKEND_BASE_URL = 'http://localhost:8080';

// Định nghĩa context path của backend
const BACKEND_CONTEXT_PATH = '/project1';

const CompanyProfile: React.FC = () => {
  // const navigate = useNavigate(); // Uncomment if you need navigation elsewhere
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Explicitly boolean
  const [isEditing, setIsEditing] = useState<boolean>(false); // Explicitly boolean
  const [error, setError] = useState<string | null>(null); // State for error message

  // Utility function to truncate long text
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // State for form data (used when editing)
  // Using Partial<Company> allows us to build the object incrementally
  const [formData, setFormData] = useState<Partial<Company>>({});

  // State to store the selected avatar file temporarily before upload
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  // State to store the preview URL for the selected new avatar
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  // Helper function to construct the full image URL
  const getFullAvatarUrl = (avatarPath: string | null | undefined): string => {
    if (!avatarPath || typeof avatarPath !== 'string') {
      return ''; // Return empty string or a placeholder if no avatar path
    }

    // Nếu avatarPath đã là URL đầy đủ, sử dụng nó
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }

    // Kết hợp base URL, context path và đường dẫn avatar
    const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
    const contextPath = BACKEND_CONTEXT_PATH.startsWith('/') ? BACKEND_CONTEXT_PATH : '/' + BACKEND_CONTEXT_PATH;
    const cleanedAvatarPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;

    return `${baseUrl}${contextPath}/${cleanedAvatarPath}`;
  };

  // Function to fetch company data - Defined outside useEffect
  // Use useCallback to memoize the function and prevent unnecessary re-creations
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors before fetching
    try {

      // Assuming getMyCompany service fetches the company profile for the logged-in user
      const response = await getMyCompany(); // Use getMyCompany - does not need accountId param
      const companyData = response.data;

      if (companyData && companyData.companyID) { // Ensure companyID is present
        setCompany(companyData);
        setFormData(companyData); // Initialize form data with fetched company data
        // Reset selected file and preview when fetching new data
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl(null);
      } else {
         throw new Error("Company profile data is incomplete or missing."); // Throw error to be caught below
      }

    } catch (err) {
      console.error("Error fetching company profile:", err);
       // Centralized error handling for fetch
       let errorMessage = "Đã xảy ra lỗi không xác định khi lấy hồ sơ công ty.";
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
                 errorMessage = "Không tìm thấy hồ sơ công ty.";
             } else if (err.response?.status === 401 || err.response?.status === 403) {
                  errorMessage = "Xác thực hoặc ủy quyền thất bại. Vui lòng đăng nhập lại.";
             } else if (err.response) {
                 errorMessage = `Lấy hồ sơ công ty không thành công: Máy chủ phản hồi trạng thái ${err.response.status}.`;
             } else if (err.request) {
                 errorMessage = "Lấy hồ sơ công ty không thành công: Không nhận được phản hồi từ máy chủ. Backend có đang chạy không?";
             } else {
                 errorMessage = `Lấy hồ sơ công ty không thành công: ${err.message}`;
             }
        } else if (err instanceof Error) {
             errorMessage = `Lấy hồ sơ công ty không thành công: ${err.message}`;
        }

         Swal.fire("Lỗi!", errorMessage, "error");
         setError(errorMessage); // Set the error state for rendering
         setCompany(null); // Ensure company state is null on error
         setFormData({}); // Clear form data on error
    } finally {
      setLoading(false);
    }
  }, []); // Add empty dependency array for useCallback

  // Effect hook to call fetchProfile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Add fetchProfile as a dependency for useEffect


  // Handle input changes for the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input change for avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setSelectedAvatarFile(file); // Store the selected file

          // Create a preview URL for the selected image
          const reader = new FileReader();
          reader.onloadend = () => {
              setAvatarPreviewUrl(reader.result as string); // Store the data URL for preview
          };
          reader.readAsDataURL(file); // Read the file as a data URL
      } else {
          setSelectedAvatarFile(null);
          setAvatarPreviewUrl(null);
      }
       // Clear the file input value to allow selecting the same file again
       e.target.value = "";
  };


  console.log(company);
  // Basic validation
  const validateForm = (): boolean => {
      // Check if required fields in formData are not empty strings after trimming whitespace
      return (
          !!formData.companyName?.trim() && // !! converts truthy/falsy to boolean
          !!formData.phone?.trim() &&
          !!formData.address?.trim()
      );
  };


  // Handle form submission for updating
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company?.companyID) {
        Swal.fire("Error", "Company ID is missing. Cannot update.", "error");
        return;
    }

    if (!validateForm()) {
         Swal.fire("Validation Error", "Please fill in all required fields (Company Name, Phone, Address, Email).", "warning");
         return;
    }

    setLoading(true); // Start loading for the entire submission process
    setError(null); // Clear previous errors before submitting

    try {
      let finalAvatarUrl = company?.avatar;

      // 1. If a new avatar file was selected, upload it first
      if (selectedAvatarFile) {
          console.log("Uploading new avatar...");
          try {
              // Call the uploadAvatar service function with companyID and the file
              // It returns the URL as a string
              finalAvatarUrl = await uploadAvatar(company.companyID, selectedAvatarFile);
              console.log("Avatar uploaded successfully. New URL:", finalAvatarUrl);
               // No need to update formData.avatar here, we use finalAvatarUrl for the updateData payload
          } catch (uploadError) {
              console.error("Avatar upload failed:", uploadError);
               // More specific error handling for avatar upload
              let uploadErrorMessage = "Tải ảnh đại diện lên không thành công.";
              if (axios.isAxiosError(uploadError)) {
                   uploadErrorMessage = `Tải ảnh đại diện lên không thành công: ${uploadError.response?.data || uploadError.message}.`;
               } else if (uploadError instanceof Error) {
                    uploadErrorMessage = `Tải ảnh đại diện lên không thành công: ${uploadError.message}`;
               } else {
                    uploadErrorMessage = `Tải ảnh đại diện lên không thành công: Đã xảy ra lỗi bất ngờ - ${uploadError}`;
               }
               Swal.fire("Lỗi Upload Avatar!", uploadErrorMessage, "error");
               setError(uploadErrorMessage); // Set the error state for rendering
               setLoading(false); // Stop loading if avatar upload fails
               return; // Stop the submission process if avatar upload fails
          }
      }

      // 2. Prepare data for updating company profile (excluding the File object if present in formData)
      // Construct the payload explicitly based on required fields + optional website and the final avatar URL
      const updateData: Partial<Company> = {
          companyName: formData.companyName,
          phone: formData.phone,
          address: formData.address,
          companyWebsite: formData.companyWebsite,
          ...(finalAvatarUrl && typeof finalAvatarUrl === 'string' && { avatar: finalAvatarUrl }),
      };


      // 3. Call the update service with the company ID and the constructed updateData
      console.log("Updating company profile with data:", updateData);
      // Correctly pass company.companyID as the first argument and updateData as the second
      const updatedCompanyResponse = await updateCompany(company.companyID, updateData);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Company profile updated successfully!",
      }).then(() => {
          setIsEditing(false); // Exit edit mode on success
          // Update the company state with the response from the update call
          setCompany(updatedCompanyResponse.data); // Assuming updateCompany returns the updated company data
          // Reset selected file and preview
          setSelectedAvatarFile(null);
          setAvatarPreviewUrl(null);
           // No need to call fetchProfile() here if updateCompany returns the updated data
      });

    } catch (err) {
      console.error("Error during company profile update:", err); // Log the full error
       // Centralized error handling for the updateCompany call
      let updateErrorMessage = "Đã xảy ra lỗi không xác định khi cập nhật hồ sơ công ty.";
      if (axios.isAxiosError(err)) {
          console.error("Axios error details:", {
              message: err.message,
              code: err.code,
              status: err.response?.status,
              statusText: err.response?.statusText,
              data: err.response?.data,
              config: err.config,
          });
           if (err.response?.status === 400) {
                updateErrorMessage = `Cập nhật không thành công: Dữ liệu gửi đi không hợp lệ. Vui lòng kiểm tra lại thông tin. (Mã lỗi: 400)`;
            }
           else if (err.response?.status === 401 || err.response?.status === 403) {
               updateErrorMessage = "Bạn không có quyền cập nhật hồ sơ công ty này hoặc phiên đăng nhập đã hết hạn.";
          } else if (err.response?.status === 404) {
               updateErrorMessage = "Không tìm thấy hồ sơ công ty để cập nhật.";
          }
          else if (err.response) {
              updateErrorMessage = `Cập nhật không thành công: Máy chủ phản hồi trạng thái ${err.response.status}.`;
          } else if (err.request) {
              updateErrorMessage = "Cập nhật không thành công: Không nhận được phản hồi từ máy chủ. Backend có đang chạy không?";
          } else {
              updateErrorMessage = `Cập nhật không thành công: ${err.message}`;
          }
      } else if (err instanceof Error) {
           updateErrorMessage = `Cập nhật không thành công: ${err.message}`;
      } else {
           updateErrorMessage = `Cập nhật không thành công: Đã xảy ra lỗi bất ngờ - ${err}`;
      }
      Swal.fire("Lỗi!", updateErrorMessage, "error");
      setError(updateErrorMessage); // Set the error state for rendering
    } finally {
        setLoading(false); // End loading
    }
  };

  // Handle Cancel button click
  const handleCancelClick = () => {
      setIsEditing(false); // Exit edit mode
      setFormData(company || {}); // Reset form data to original company data (use {} if company is null)
      setSelectedAvatarFile(null); // Clear selected file
      setAvatarPreviewUrl(null); // Clear preview
      setError(null); // Clear error state on cancel
  };


  // Render loading state
  if (loading) {
    return <p>Loading company profile...</p>;
  }

  // Render error state
  // Display error message if there's an error and no company data
  if (error && !company) {
      return <p className="text-danger">{error}</p>;
  }

   // If not loading, no error, and no company data, display not found
  if (!loading && !error && !company) {
       return <p>Company profile not found.</p>;
   }


  // Render the company profile form or view (company is guaranteed to exist here if we reach this point)
  return (
    <div id="CompanyProfile" className="container mt-4"> {/* Use container for better layout */}
      <h2>Company Profile</h2>

      {/* Use company state directly for view mode */}
      {!isEditing ? (
        // === View Mode ===
        <div className="company-profile-view card"> {/* Add card class for styling */}
            <div className="card-body">
                {(company?.avatar && typeof company.avatar === 'string') && (
                     <div className="profile-avatar mb-3 text-center"> {/* Center avatar */}
                         <img
                              src={getFullAvatarUrl(company.avatar)}
                              alt="Company Avatar"
                              style={{ maxWidth: '150px', borderRadius: '8px' }}
                          />
                     </div>
                )}
            

                {/* Company Details */}
                <div className="profile-details"> {/* Add a class for styling */}
                    <p><strong>Company Name:</strong> {company?.companyName}</p>
                    <p><strong>Phone:</strong> {company?.phone}</p>
                    <p><strong>Address:</strong> {truncateText(company?.address || '')}</p>
                    {company?.companyWebsite && (
                        <p><strong>Website:</strong> <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer">{company.companyWebsite}</a></p>
                    )}
                    {/* Add other company details you want to display in view mode */}
                </div>

                {/* Action Button - View Mode */}
                <div className="mt-3 text-center"> {/* Center button */}
                     <button
                       type="button"
                       className="btn btn-primary"
                       onClick={() => setIsEditing(true)} // Enter edit mode
                       disabled={loading}
                     >
                       Edit Profile
                     </button>
                </div>
          </div>
        </div>
      ) : (
        // === Edit Mode ===
        <div className="company-profile-edit card"> {/* Add card class for styling */}
            <div className="card-body">
                <form className="forms-sample" onSubmit={handleSubmit}>
                  {/* Company Name */}
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows={4}
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Company Website */}
                  <div className="form-group">
                    <label htmlFor="companyWebsite">Company Website</label>
                    <input
                      type="url" // Use type="url" for better validation
                      className="form-control"
                      id="companyWebsite"
                      name="companyWebsite"
                      value={formData.companyWebsite || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Avatar (File Input) */}
                  <div className="form-group">
                      <label htmlFor="avatar">Avatar</label>
                       {/* Display selected new avatar file name */}
                       {selectedAvatarFile && (
                            <small className="form-text text-muted">Selected file: {selectedAvatarFile.name}</small>
                       )}
                       <input
                           type="file"
                           className="form-control-file"
                           id="avatar"
                           name="avatar"
                           accept="image/*" // Accept image files
                           onChange={handleAvatarChange}
                       />
                       {/* Display preview of the newly selected avatar OR the current avatar */}
                       {(avatarPreviewUrl || (formData.avatar && typeof formData.avatar === 'string')) && (
                           <div className="mt-2 text-center">
                                <img
                                    src={avatarPreviewUrl || (formData.avatar && typeof formData.avatar === 'string' ? getFullAvatarUrl(formData.avatar) : '')}
                                    alt={avatarPreviewUrl ? "Avatar Preview" : "Current Avatar"}
                                    style={{ maxWidth: '150px', borderRadius: '8px' }}
                                />
                           </div>
                       )}
                  </div>

                  {/* Action Buttons - Edit Mode */}
                  <div className="mt-3 text-center"> {/* Center buttons */}
                      <button type="submit" className="btn btn-success mr-2" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancelClick} // Use handleCancelClick
                        disabled={loading}
                      >
                        Cancel
                      </button>
                  </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
