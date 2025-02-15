import mongoose, { models, Schema } from "mongoose";
import { isNullOrUndefined } from "util";

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
    freelancerId: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    coverLetter: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    bidDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String, required: true }],
    budget: { type: Number, required: true },
    deadline: { type: Date, required: true },
    postedAt: { type: Date, default: Date.now },
    bids: { type: [bidSchema], default: [] },
  },
  { _id: false }
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
  { _id: false }
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
  { _id: false }
);

const userSchema = new Schema(
  {
    lastUpdatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
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
  { versionKey: false }
);

const clientModel = models.clients || mongoose.model("clients", userSchema);

export default clientModel;
