import mongoose, { models, Schema } from "mongoose";
import { userRole } from "./userModel";

export enum LANGUAGE_ENUM {
  BASIC = "BASIC",
  FLUENT = "FLUENT",
  NATIVE = "NATIVE",
  INTERMEDIATE = "INTERMEDIATE",
}

export enum KYC_STATUS_ENUM {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum EXPERIENCE_LEVEL_ENUM {
  JUNIOR = "JUNIOR",
  MID = "MID",
  SENIOR = "SENIOR",
}

export enum TRANSACTION_STATUS_ENUM {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  images: [{ type: String, default: null }],
  links: [{ type: String, default: null }],
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
},{
  timestamps: true
});
const educationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
},{timestamps: true});

const bidSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  proposal: { type: String, default: null },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING",
  },
  submittedAt: { type: Date, default: Date.now },
},{
  timestamps: true
});

const transactionSchema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["WITHDRAWAL", "DEPOSIT"], required: true },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS_ENUM),
    default: TRANSACTION_STATUS_ENUM.PENDING,
  },
},{
  timestamps: true
});

const bankDetailsSchema = new Schema({
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  swiftCode: { type: String, default: null },
  ifscCode: { type: String, default: null },
  linkedEmail: { type: String, required: true },
},{
  timestamps: true
});
const employmentSchema = new Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: null },
  currentlyWorking: { type: Boolean, default: false },
  description: { type: String, default: null },
},{
  timestamps: true
});

const kycSchema = new Schema({
  documentType: { type: String, required: true },
  documentNumber: { type: String, required: true },
  documentFile: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(KYC_STATUS_ENUM),
    default: KYC_STATUS_ENUM.PENDING,
  },
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date, default: null },
},{
  timestamps: true
});

const skillSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: Number, min: 1, max: 5, required: false, default: 3 },
},{
  timestamps: true
});

const certificationSchema = new Schema({
  id: { type: String, required: false, default: null },
  title: { type: String, required: true },
  provider: { type: String, required: true },
  issueDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  credentialUrl: { type: String, default: null },
},{
  timestamps: true
});

const testScoreSchema = new Schema({
  id: { type: String, required: false, default: null },
  testName: { type: String, required: true },
  score: { type: Number, required: true },
  dateTaken: { type: Date, default: null },
},{
  timestamps: true
});

const freelancerSchema = new Schema(
  {
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.FREELANCER,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    emailId: { type: String, required: true, unique: true },
    taxNumber: { type: String, default: null },
    mobileNumber: { type: String, required: false, default: "" },
    title: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    secondaryMobileNumber: { type: String, default: null },
    location: { type: String, default: null },
    availability: { type: Boolean, default: false },
    connects: { type: Number, default: 100 },
    languages: {
      type: [
        {
          name: { type: String, required: true },
          level: {
            type: String,
            enum: Object.values(LANGUAGE_ENUM),
            required: true,
          },
          id: {
            type: String,
            required: false,
            default: null,
          },
        },
      ],
      default: [],
    },
    resume: { type: String, default: null },
    employmentHistory: { type: [employmentSchema], default: [] },
    educationHistory: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    kyc: { type: kycSchema, default: null },
    skills: { type: [skillSchema], default: [] },
    socialProfiles: {
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      portfolio: { type: String, default: null },
    },
    hourlyRate: { type: Number, default: null },
    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVEL_ENUM),
      default: EXPERIENCE_LEVEL_ENUM.JUNIOR,
    },
    bids: { type: [bidSchema], default: [] },
    earnings: { type: Number, default: 0 },
    withdrawalHistory: { type: [transactionSchema], default: [] },
    bankDetails: { type: bankDetailsSchema, default: null },
  },
  { versionKey: false,timestamps: true }
);

const freelancerModel =
  models.freelancerUsers || mongoose.model("freelancerUsers", freelancerSchema);

export default freelancerModel;
