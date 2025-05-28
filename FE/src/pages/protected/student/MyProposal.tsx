import React, { useEffect, useState } from 'react';
import { Proposal } from '../../../types/DataTypes';
import { getProposalsByStudent } from '../../../services/ProposalService';
import { useNavigate } from 'react-router-dom';

const MyProposal = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                setLoading(true);
                const response = await getProposalsByStudent();
                if (response.data) {
                    // Log student data for debugging
                    console.log('Proposals data:', response.data);
                    setProposals(response.data);
                } else {
                    setError('Không tìm thấy thông tin đơn thực tập.');
                }
            } catch (err) {
                console.error('Lỗi khi tải danh sách đơn thực tập:', err);
                setError('Không thể tải danh sách đơn thực tập. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, []);

    const handleCreateProposal = () => {
        navigate('/proposals/create');
    };

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-5">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách đơn thực tập</h2>
                <button 
                    className="btn btn-primary"
                    onClick={handleCreateProposal}
                >
                    <i className="ti-plus me-2"></i>
                    Tạo đơn thực tập
                </button>
            </div>
            
            {proposals.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-4">Bạn chưa có đơn thực tập nào.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>STT</th>
                                <th>Vị trí thực tập</th>
                                <th>Tên công ty</th>
                                <th>Mô tả công việc</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map((proposal, index) => (
                                <tr key={proposal.proposalID}>
                                    <td>{index + 1}</td>
                                    <td>{proposal.jobPosition}</td>
                                    <td>{proposal.companyName}</td>
                                    <td>{proposal.taskDescription}</td>
                                    <td>
                                        <span className={`badge ${
                                            proposal.status === 'PENDING' ? 'bg-warning' :
                                            proposal.status === 'APPROVED' ? 'bg-success' :
                                            proposal.status === 'REJECTED' ? 'bg-danger' :
                                            'bg-secondary'
                                        }`}>
                                            {proposal.status === 'PENDING' ? 'Đang chờ duyệt' :
                                             proposal.status === 'APPROVED' ? 'Đã duyệt' :
                                             proposal.status === 'REJECTED' ? 'Đã từ chối' :
                                             proposal.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyProposal; 