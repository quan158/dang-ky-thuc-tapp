package com.quan.project1.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode
{
    UNCATEGORIZED_EXCEPTION(9999,"Uncategorized error",HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1004,"Invalid message key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001,"User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003, "Password must be at least 8 characters",HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005,"user not existed",HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006,"You do not have permission to perform this action",HttpStatus.UNAUTHORIZED),
    COMPANY_EXISTED(1007,"Company existed",HttpStatus.BAD_REQUEST),
    STUDENT_EXISTED(1007,"Student code existed",HttpStatus.BAD_REQUEST),
    STUDENT_NOT_FOUND(1008,"Student not found",HttpStatus.BAD_REQUEST),
    COMPANY_NOT_FOUND(1008,"Company not found",HttpStatus.BAD_REQUEST),
    PROPOSAL_NOT_FOUND(1008,"Proposal nơt found",HttpStatus.BAD_REQUEST),
    INTERNSHIP_NOT_FOUND(1008,"Internship nơt found",HttpStatus.BAD_REQUEST),
    APPLICATION_NOT_FOUND(1008,"Application nơt found",HttpStatus.BAD_REQUEST),
    INVALID_ACTION(1009,"Trạng thái không phù hợp để cập nhật",HttpStatus.BAD_REQUEST),
    ALREADY_HAS_ACTIVE_PROPOSAL(1010,"Bạn đã có đề xuất đang xử lý hoặc đã được duyệt",HttpStatus.BAD_REQUEST),
    STUDENT_ALREADY_INTERNAL(1011,"Bạn đã đăng ký thực tập rồi",HttpStatus.BAD_REQUEST),
    RECRUITMENT_FULL(1012,"Số lượng tuyển đã đủ",HttpStatus.BAD_REQUEST),
    INVALID_INPUT(1013 ,"File rỗng" , HttpStatus.BAD_REQUEST);

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;

}
