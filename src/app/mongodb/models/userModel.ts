import mongoose, { models, Schema } from "mongoose";

export enum userRole {
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
}

const messageSchema = new Schema(
  {
    sender: { type: String, required: true }, 
    receiver: { type: String, required: true }, 
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["SENT", "DELIVERED", "READ"], default: "SENT" },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    lastUpdatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    authToken: { type: String, required: false, default: "" },
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
    profile: { type: String, required: false, default: null },
    online: { type: Boolean, required: false, default: false },
    messages: {
      type: Object,
      default: {},
    },
  },
  { versionKey: false }
);

const userModel = models.users || mongoose.model("users", userSchema);

export default userModel;
