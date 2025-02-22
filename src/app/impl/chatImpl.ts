import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel from "../mongodb/models/freelancerModel";
import projectModel from "../mongodb/models/projectModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";

export async function chatImpl(user: {
  authToken: string;
  receiver: string;
  message: string;
  project?: any;
}): Promise<{ status: number; message: any; data?: any }> {
  await connectDB("users");

  const emailId = decodeString(user.authToken);
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b\d{10,}\b/;

  if (emailRegex.test(user.message) || phoneRegex.test(user.message)) {
    return {
      status: 200,
      message: userEnums?.CONTACT_INFO_NOT_ALLOWED,
    };
  }

  const senderData = await userModel.findOne({ emailId: emailId });

  const receiverData = await userModel.findOne({ emailId: user.receiver });

  if (!senderData || !receiverData) {
    return {
      status: 404,
      message: userEnums.USER_NOT_FOUND,
    };
  }

  const senderMessages =
    senderData?.messages[user.receiver.replace(/\./g, "_")]?.messages || [];

  const newMessage = {
    sender: emailId.replace(/\./g, "_"),
    receiver: user.receiver.replace(/\./g, "_"),
    content: user.message,
    status: "SENT",
    timestamp: new Date(),
  };

  senderMessages.push(newMessage);
  let projetData = {};
  if (user?.project) {
    projetData = (await projectModel.findOne({ id: user?.project })) ?? {};
  }

  const path = `messages.${user.receiver.replace(/\./g, "_")}.messages`;
  const pathName = `messages.${user.receiver.replace(/\./g, "_")}.name`;
  const pathProfile = `messages.${user.receiver.replace(/\./g, "_")}.profile`;
  const pathProfileRead = `messages.${user.receiver.replace(/\./g, "_")}.read`;
  const assignedProjectData = `messages.${user.receiver.replace(
    /\./g,
    "_"
  )}.project`;

  await userModel.updateOne(
    { emailId: emailId },
    {
      $set: {
        [path]: senderMessages,
        [pathName]:
          receiverData?.firstName + " " + (receiverData?.lastName ?? ""),
        [pathProfile]: receiverData?.profile,
        [pathProfileRead]: senderMessages.length,
        [assignedProjectData]: projetData,
      },
    }
  );

  const receiverMessages =
    receiverData?.messages[emailId.replace(/\./g, "_")]?.messages || [];

  const newReceiverMessage = {
    sender: emailId,
    receiver: user.receiver.replace(/\./g, "_"),
    content: user.message,
    status: "SENT",
    timestamp: new Date(),
  };

  receiverMessages.push(newReceiverMessage);

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

        [`messages.${emailId.replace(/\./g, "_")}.project`]: projetData,
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
