import mongoose, { models, Schema } from "mongoose";

export enum userRole {
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
}

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
    loggedIn: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(userRole),
      required: true,
      default: userRole.FREELANCER,
    },
  },
  { versionKey: false }
);

const userModel = models.users || mongoose.model("users", userSchema);

export default userModel;
