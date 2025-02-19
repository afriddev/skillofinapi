
export enum PROJECT_STATUS_ENUM {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
  }
  
  export enum BID_STATUS_ENUM {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
  }
  
  export enum PAYMENT_STATUS_ENUM {
    PENDING = "PENDING",
    RELEASED = "RELEASED",
    DISPUTED = "DISPUTED",
  }
  
  export interface IBid {
    freelancerEmail: string;
    bidAmount: number;
    coverLetter: string;
    status: BID_STATUS_ENUM;
    bidDate: Date;
  }
  
  export interface IMilestone {
    description: string;
    amount: number;
    dueDate: Date;
    status: PAYMENT_STATUS_ENUM;
  }
  
  export interface IPayment {
    freelancerEmail: string;
    amount: number;
    status: PAYMENT_STATUS_ENUM;
    paymentDate: Date | null;
  }
  
  export interface jobPostType  {
    id: string;
    clientEmail: string;
    title: string;
    description?: string | null;
    skillsRequired: string[];
    budget: number;
    costPerHour: number;
    deadline?: Date | null;
    status: PROJECT_STATUS_ENUM;
    bids: IBid[];
    assignedFreelancerEmail?: string | null;
    milestones: IMilestone[];
    payments: IPayment[];
    totalPaid: number;
    createdAt: Date;
    lastUpdatedAt: Date;
  }
  