import mongoose, { models, Schema } from "mongoose";
import { userRole } from "./clientModel";

const commentSchema = new Schema(
  {
    name: { type: String, required: true },
    commentText: { type: String, required: true },
    profile: { type: String, required: false },
    emailId:{type:String,required:true}
  },
  { _id: false, timestamps: true }
);
const postSchema = new Schema(
  {
    emailId: { type: String, required: true },
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    profile: { type: String, required: false, default: null },
    image: [{ type: String, required: false, default: null }],
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    name: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const userSchema = new Schema(
  {
    authToken: { type: String, required: false, default: null },
    browserToken: { type: String, required: false, default: null },
    refreshToken: { type: String, required: false, default: null },
    otp: { type: Number },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    loggedIn: { type: Boolean, default: false },
    countryName: { type: String, default: null, required: false },
    currency: { type: String, default: null, required: false },
    countryCode: { type: String, default: null, required: false },
    posts: { type: [postSchema], required: false, default: null },
    paymentConnectId: { type:String, required: false, default: null },
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
    bakAccountDetails: {
      type: Object,
      default: {},
    },
  },
  { versionKey: false, timestamps: true }
);

const userModel = models.users || mongoose.model("users", userSchema);

export default userModel;
