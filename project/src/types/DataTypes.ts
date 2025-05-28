
export interface Student {
  studentID: string;
  studentCode: string;
  fullname: string;
  major: string;
  cv: string;
  address: string;
  status: string;
  email: string;
  accountId: string;
  classroom: string;
  dateOfBirth: string; // ISO 8601 date string
  proposals?: Proposal[];
  createAt: string; // ISO 8601
}

export interface Proposal {
  proposalID: string;
  companyName: string;
  companyLogo: string;
  employeeSize: string;
  address: string;
  location: string;
  taxNumber: string;
  websiteUrl: string;
  hrName: string;
  hrMail: string;
  taskDescription: string;
  jobPosition: string;
  evidence: string | null;
  status: string | null;
  studentResponse: {
    studentCode: string;
    fullname: string;
    major: string;
    cv: string;
    classroom: string;
    address: string;
    status: string;
    createAt: string;
    accountResponse: {
      accountID: string;
      username: string;
      email: string | null;
      fullname: string;
      createAt: string;
      status: string;
      roles: string[];
    };
  };
}

export interface Internship {
  internshipID: string;
  position: string;
  description: string;
  requirement: string | null;
  benefits: string | null;
  recruitmentQuantity: number;
  status: string;
  companyResponse: {
    companyID: string;
    companyName: string;
    phone: string;
    address: string;
    email: string | null;
    companyWebsite: string;
    avatar: string;
    accountResponse: {
      accountID: string;
      username: string;
      email: string | null;
      fullname: string;
      createAt: string;
      status: string;
      roles: string[];
    };
  };
}

export interface InternshipCreationPayload {
  position: string;
  description: string;
  requirement: string;
  benefits: string;
  recruitmentQuantity: number;
}

export interface Company {
  companyID: string;
  companyName: string;
  phone: string;
  address: string;
  companyWebsite: string;
  avatar: File | string;
  accountId: string;
}

export interface Application {
  applicationID: string;
  student: Student;
  internship: Internship;
  status: string;
  appliedAt: string;
  readonly approvedAt: string | null;
}

export interface Account {
  accountID: string;
  password: string;
  username: string;
  fullname?: string;
  createAt: string;
  status: string;
  roles: string[]; 
  email: string;
}

export interface AccountCreationPayload {
  username: string;
  password: string;
  fullname: string;
  email: string;
  status: string;
  roles: string[];
}

export interface ApplicationResponse {
  applicationID: string;
  student: Student;
  internship: Internship;
  status: string;
  appliedAt: string;
  approvedAt: string | null;
}

export interface StudentApplied {
  studentId: number;
  applyId: number;
  studentCode: string;
  major: string;
  address: string;
  cvImage: string;
  applyStatus: string;
  internshipPosition: string;
}