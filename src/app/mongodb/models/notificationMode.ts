import mongoose, { models, Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    emailId: { type: String, required: false, default: null },
    profile: { required: false, type: String, default: null },
    firstName: { required: false, type: String, default: null },
    lastName: { required: false, type: String, default: null },
    title: { required: true, type: String },
    content: {
      required: true,
      type: String,
    },
    notificationType: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const notificationsSchema = new Schema(
  {
    emailId: { type: String, required: true },
    read: {
      type: Number,
      required: true,
      default: 0,
    },
    notifications: {
      type: [notificationSchema],
      required: false,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const notificationsModel =
  models.notifications || mongoose.model("notifications", notificationsSchema);
export default notificationsModel;
