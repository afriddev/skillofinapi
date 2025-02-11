import mongoose, { models, Schema } from "mongoose";

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
    bidDate: { type: Date, default: Date.now },
  },
  { _id: false }
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
});

const projectSchema = new Schema(
  {
    clientEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    skillsRequired: [{ type: String, required: true }],
    budget: { type: Number, required: true },
    deadline: { type: Date, required: true },
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
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const projectModel =
  models.projects || mongoose.model("projects", projectSchema);

export default projectModel;
