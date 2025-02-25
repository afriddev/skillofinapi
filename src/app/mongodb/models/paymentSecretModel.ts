import mongoose, { models, Schema } from "mongoose";

const clientSecretsSchema = new Schema(
  {
    amount: { required: true, type: Number },
    currency: { required: true, type: String },
    clientSecret: {
      required: true,
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const paymentSecretsSchema = new Schema(
  {
    emailId: { type: String, required: true },
    clientSecrets: {
      type: [clientSecretsSchema],
      required: false,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const paymentClientSecretModel =
  models.paymentClientSecrets ||
  mongoose.model("paymentClientSecrets", paymentSecretsSchema);
export default paymentClientSecretModel;
