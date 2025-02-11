import mongoose, { models, Schema } from "mongoose";

const contactedUsersSchema = new Schema(
  {
    createdAt: {
      type: String,
      required: false,
      default: null,
    },
    emailId: {
      type: String,
      required: true,
      immutable: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
  }
);

const contactedUsersModel =
  models.users || mongoose.model("users", contactedUsersSchema);

export default contactedUsersModel;
