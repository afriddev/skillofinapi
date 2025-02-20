"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
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

  const projectData = await projectModel.findOne({
    id: user?.id,
  });
  const bidData = projectData?.bids?.filter(
    (bid: any) => bid?.freelancerEmail === user?.freelancerEmailId
  );
  bidData.status = BID_STATUS_ENUM?.ACCEPTED;
  const bids = [];
  bids.push(bidData);

  await projectModel.findOneAndUpdate(
    {
      id: projectData?.id,
    },
    {
      $set: {
        bids,
        status: PROJECT_STATUS_ENUM?.IN_PROGRESS,
      },
    }
  );

  await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `
        <div style="font-family: Arial, sans-serif; background-color: #222; color: white; padding: 15px; border-radius: 8px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #ffcc00;">
            Job Application Approved
          </h3>
          <p style="font-size: 14px; margin-bottom: 10px;">
            Congratulations! Your job application has been approved. Below are the details:
          </p>
          <p><strong>Project Title:</strong> ${projectData?.title}</p>
          <p><strong>Project Description:</strong> ${projectData?.description}</p>
          <p><strong>Approved By:</strong> ${emailId}</p>
        </div>
      `,
      receiver: user?.freelancerEmailId,
      authToken: user?.authToken,
    }),
  });

  return { status: 200, message: responseEnums?.SUCCESS };
}
