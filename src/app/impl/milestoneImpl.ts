"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import projectModel from "../mongodb/models/projectModel";
import userModel from "../mongodb/models/userModel";
import { PAYMENT_STATUS_ENUM } from "../types/projectTypes";
import { decodeString } from "../utils/auth/authHandlers";

export async function milestoneImpl(user: {
  emailId: string;
  id: string; // Project ID
  amount?: string;
  description?: string;
  date?: string;
  milestoneId?: string; // Milestone _id (for deletion)
  method: string; // "create" or "delete"
}): Promise<{
  status: number;
  message: any;
  data?:any
}> {
  await connectDB("users");
  const emailId = decodeString(user?.emailId);
  const BASE_URL = "https://skillofinapi.vercel.app/api";

  if (user.method === "delete") {
    const projectData = await projectModel.findOneAndUpdate(
      { id: user.id },
      {
        $pull: { milestones: { _id: user.milestoneId } },
      },
      { new: true }
    );

    await clientModel.findOneAndUpdate(
      { emailId },
      {
        $pull: {
          "postedProjects.$[proj].milestones": { _id: user.milestoneId },
        },
      },
      {
        arrayFilters: [{ "proj.id": user.id }],
        new: true,
      }
    );

    const notificationMessage = `
    <div style="font-family: Arial, sans-serif; background-color: #fff; color: #000; padding: 12px; border: 1px solid #ccc; border-radius: 6px;">
      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #dc3545;">
        Milestone Removed
      </h3>
      <p style="font-size: 12px; margin-bottom: 8px;">
        A milestone has been removed from your project. Please check the updated project details.
      </p>
      <p style="font-size: 12px;"><strong style="color: #28a745;">Project Title:</strong> ${projectData?.title}</p>
    </div>
  `;

    await fetch(BASE_URL + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: notificationMessage.trim(),
        receiver: projectData?.assignedFreelancerEmail,
        emailId: user?.emailId,
        project: projectData?.id,
      }),
    });

    return { status: 200, message: responseEnums?.SUCCESS,data:notificationMessage?.trim() };
  }

  const userData = await userModel.findOne({ emailId });
  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  const newMilestone = {
    description: user.description ?? "",
    dueDate: user.date ?? "",
    status: PAYMENT_STATUS_ENUM?.PENDING,
    amount: user.amount ?? "0",
  };

  const projectData = await projectModel.findOneAndUpdate(
    { id: user.id },
    {
      $push: { milestones: newMilestone },
    },
    { new: true }
  );

  await clientModel.findOneAndUpdate(
    { emailId },
    {
      $push: {
        "postedProjects.$[proj].milestones": newMilestone,
      },
    },
    {
      arrayFilters: [{ "proj.id": user?.id }],
      new: true, // Return updated document
    }
  );

  const notificationMessage = `
  <div style="font-family: Arial, sans-serif; background-color: #fff; color: #000; padding: 12px; border: 1px solid #ccc; border-radius: 6px;">
    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #007bff;">
      New Milestone Created
    </h3>
    <p style="font-size: 12px; margin-bottom: 8px;">
      A new milestone has been added to your project. Details are below:
    </p>
    <p style="font-size: 12px;"><strong style="color: #28a745;">Project Title:</strong> ${projectData?.title}</p>
    <p style="font-size: 12px;"><strong style="color: #28a745;">Milestone Description:</strong> ${newMilestone.description}</p>
    <p style="font-size: 12px;"><strong style="color: #28a745;">Due Date:</strong> ${newMilestone.dueDate}</p>
    <p style="font-size: 12px;"><strong style="color: #28a745;">Amount:</strong> ${newMilestone.amount}</p>
  </div>
`;

  await fetch(BASE_URL + "/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: notificationMessage.trim(),
      receiver: projectData?.assignedFreelancerEmail,
      emailId: user?.emailId,
      project: projectData?.id,
    }),
  });

  return { status: 200, message: responseEnums?.SUCCESS,data:notificationMessage.trim() };
}
