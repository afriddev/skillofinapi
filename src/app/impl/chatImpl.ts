import { responseEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";

export async function chatImpl(user: {
  authToken: string;
  receiver: string;
  message: string;
}): Promise<{ status: number; message: any; data?: any }> {
  await connectDB("users");

  const emailId = decodeString(user.authToken);

  // Find the sender's user data
  const senderData = await userModel.findOne({ emailId: emailId });

  // Find the receiver's user data
  const receiverData = await userModel.findOne({ emailId: user.receiver });

  if (!senderData || !receiverData) {
    return {
      status: 404,
      message: "User not found",
    };
  }

  // Sender's messages
  const senderMessages =
    senderData?.messages[user.receiver.replace(/\./g, "_")]?.messages || [];

  // Construct the new message
  const newMessage = {
    sender: emailId.replace(/\./g, "_"),
    receiver: user.receiver.replace(/\./g, "_"),
    content: user.message,
    status: "SENT", // Default status for new messages
    timestamp: new Date(),
  };

  senderMessages.push(newMessage); // Add the new message to sender's messages

  const path = `messages.${user.receiver.replace(/\./g, "_")}.messages`;
  const pathName = `messages.${user.receiver.replace(/\./g, "_")}.name`;
  const pathProfile = `messages.${user.receiver.replace(/\./g, "_")}.profile`;
  const pathProfileRead = `messages.${user.receiver.replace(/\./g, "_")}.read`;

  await userModel.updateOne(
    { emailId: emailId },
    {
      $set: {
        [path]: senderMessages,
        [pathName]:
          receiverData?.firstName + " " + (receiverData?.lastName ?? ""),
        [pathProfile]: receiverData?.profile,
        [pathProfileRead]: senderMessages.length,
      },
    }
  );

  // Receiver's messages
  const receiverMessages =
    receiverData?.messages[emailId.replace(/\./g, "_")]?.messages || [];

  // Add the same message to the receiver's messages
  const newReceiverMessage = {
    sender: emailId,
    receiver: user.receiver.replace(/\./g, "_"),
    content: user.message,
    status: "SENT", // Default status
    timestamp: new Date(),
  };

  receiverMessages.push(newReceiverMessage); // Add message to receiver's messages

  // Update receiver's messages (push new message to the specific sender's key)
  await userModel.updateOne(
    { emailId: user.receiver },
    {
      $set: {
        [`messages.${emailId.replace(/\./g, "_")}.messages`]: receiverMessages,
        [`messages.${emailId.replace(/\./g, "_")}.name`]:
          senderData?.firstName + " " + (senderData?.lastName ?? ""),
        [`messages.${emailId.replace(/\./g, "_")}.profile`]:
          senderData?.profile,

        [`messages.${emailId.replace(/\./g, "_")}.read`]:
          receiverData?.messages[emailId.replace(/\./g, "_")]?.read ?? 0,
      },
    }
  );

  const userAccountModel =
    senderData?.role === userRole.FREELANCER ? freelancerModel : clientModel;

  return {
    status: 200,
    message: responseEnums.SUCCESS,
    data: {
      userData: await userModel.findOne({ emailId }),
      userAccountData: await userAccountModel?.findOne({ emailId }),
    },
  };
}
