import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiver: string;
  text: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: { type: String, required: true }, // Sender's email ID
    receiver: { type: String, required: true }, // Receiver's email ID
    text: { type: String, required: true }, // Message text
    timestamp: { type: Date, default: Date.now }, // Message timestamp
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
