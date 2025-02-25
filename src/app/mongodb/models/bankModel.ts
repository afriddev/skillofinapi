import mongoose, { models, Schema } from "mongoose";
import { userRole } from "./clientModel";





const bankSchema = new Schema(
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
      default: userRole.BANK,
    },
    bankName: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    website: { type: String, required: false, default: null },
    industry: { type: String, required: false, default: null },
    location: { type: String, required: false, default: null },
  },
  { versionKey: false, timestamps: true }
);

const bankModel = models.banks || mongoose.model("banks", bankSchema);

export default bankModel;
