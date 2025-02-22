"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import projectModel from "../mongodb/models/projectModel";
import userModel from "../mongodb/models/userModel";
import { BID_STATUS_ENUM, PROJECT_STATUS_ENUM } from "../types/projectTypes";
import { decodeString } from "../utils/auth/authHandlers";

export async function approveBidImpl(user: {
  authToken: string;
  id: string;
  freelancerEmailId: string;
}): Promise<{
  status: number;
  message: any;
}> {
  await connectDB("users");

  const emailId = decodeString(user?.authToken);
  const userData = await userModel.findOne({ emailId });
  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  const projectData = await projectModel.findOne({ id: user?.id });
  if (!projectData) {
    return { status: 404, message: "Project not found" };
  }

  const bidIndex = projectData?.bids?.findIndex(
    (bid: any) => bid?.freelancerEmail === user?.freelancerEmailId
  );

  if (bidIndex === -1) {
    return { status: 404, message: "Bid not found" };
  }

  projectData.bids[bidIndex].status = BID_STATUS_ENUM.ACCEPTED;

  await projectModel.findOneAndUpdate(
    { id: projectData?.id },
    {
      $set: {
        bids: projectData.bids,
        status: PROJECT_STATUS_ENUM.IN_PROGRESS,
      },
    }
  );

  await clientModel.findOneAndUpdate(
    { emailId },
    {
      $set: {
        "postedProjects.$[proj].bids": projectData.bids,
        "postedProjects.$[proj].status": PROJECT_STATUS_ENUM.IN_PROGRESS,
      },
    },
    {
      arrayFilters: [{ "proj.id": projectData?.id }],
    }
  );

  const notificationMessage = `
  <div style="font-family: Arial, sans-serif; background-color: #fff; color: #000; padding: 12px; border: 1px solid #ccc; border-radius: 6px;">
    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #007bff;">
      Job Application Approved
    </h3>
    <p style="font-size: 12px; margin-bottom: 8px;">
      Congratulations! Your job application has been approved. Details are below:
    </p>
    <p style="font-size: 12px;"><strong style="color: #28a745;">Project Title:</strong> ${projectData?.title}</p>
    <p style="font-size: 12px;"><strong style="color: #28a745;">Project Description:</strong> ${projectData?.description}</p>
  </div>
`;

  const BASE_URL = "https://skillofinapi.vercel.app/api" 
  // const BASE_URL = "http://localhost:3000/api";

  await fetch(BASE_URL + "/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: notificationMessage.trim(),
      receiver: user?.freelancerEmailId,
      authToken: user?.authToken,
      project: projectData?.id,
    }),
  });


  return { status: 200, message: responseEnums?.SUCCESS };
}
