import mongoose, { models, Schema } from "mongoose";
import { BID_STATUS_ENUM, PAYMENT_STATUS_ENUM, PROJECT_STATUS_ENUM } from "./projectModel";

export enum userRole {
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
}

export enum TRANSACTION_STATUS_ENUM {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PAYMENT_METHOD_ENUM {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  BANK_TRANSFER = "BANK_TRANSFER",
}

const bidSchema = new Schema(
  {
    freelancerEmail: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    coverLetter: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BID_STATUS_ENUM),
      default: BID_STATUS_ENUM.PENDING,
    },
    profile: { type: String, required: false },
    name: { type: String, required: false },
    read: { type: Number, required: false },

    bidDate: { type: Date, default: Date.now },
  },
  { _id: false,timestamps: true }
);


const milestoneSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS_ENUM),
    default: PAYMENT_STATUS_ENUM.PENDING,
  },
},{
  timestamps: true
});

const paymentSchema = new Schema({
  freelancerEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS_ENUM),
    default: PAYMENT_STATUS_ENUM.PENDING,
  },
  paymentDate: { type: Date, default: null },
},{
  timestamps: true
});

const projectSchema = new Schema(
  {
    id: { type: String, required: true },
    clientEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    skillsRequired: [{ type: String, required: true }],
    budget: { type: Number, required: false, default: 0 },
    costPerHour: { type: Number, required: false, default: 0 },
    deadline: { type: Date, required: false, default: null },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS_ENUM),
      default: PROJECT_STATUS_ENUM.OPEN,
    },
    bids: { type: [bidSchema], default: [] },
    assignedFreelancerEmail: { type: String, default: null },
    milestones: { type: [milestoneSchema], default: [] },
    payments: { type: [paymentSchema], default: [] },
    totalPaid: { type: Number, default: 0 },
  },
  { versionKey: false ,timestamps: true}
);

const transactionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["PAYMENT", "REFUND", "DEPOSIT"],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS_ENUM),
      default: TRANSACTION_STATUS_ENUM.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD_ENUM),
      required: true,
    },
    projectId: { type: String, default: null },
    freelancerId: { type: String, default: null },
  },
  { _id: false,timestamps: true }
);

const bankDetailsSchema = new Schema(
  {
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    swiftCode: { type: String, default: null },
    ifscCode: { type: String, default: null },
    linkedEmail: { type: String, required: true },
  },
  { _id: false ,timestamps: true}
);

const userSchema = new Schema(
  {
    authToken: { type: String },
    otp: { type: Number },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: {
      type: String,
      enum: Object.values(userRole),
      required: true,
      default: userRole.CLIENT,
    },
    companyName: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    website: { type: String, required: false, default: null },
    industry: { type: String, required: false, default: null },
    location: { type: String, required: false, default: null },
    postedProjects: { type: [projectSchema], default: [] },
    totalSpent: { type: Number, default: 0 },
    transactions: { type: [transactionSchema], default: [] },
    bankDetails: { type: bankDetailsSchema, default: null },
  },
  { versionKey: false,timestamps: true }
);

const clientModel = models.clients || mongoose.model("clients", userSchema);

export default clientModel;
