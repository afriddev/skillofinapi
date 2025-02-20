import mongoose, { models, Schema } from "mongoose";

const tempUsersSchema = new Schema({
  emailId: String,
  otp: Number,
},{
  versionKey: false,
  timestamps: true
});

const tempUsersModel =
  models.tempusers || mongoose.model("tempusers", tempUsersSchema);
export default tempUsersModel;
