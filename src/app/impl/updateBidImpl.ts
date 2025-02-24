"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel from "../mongodb/models/clientModel";
import projectModel from "../mongodb/models/projectModel";
import userModel from "../mongodb/models/userModel";
import { BID_STATUS_ENUM } from "../types/projectTypes";
import { decodeString } from "../utils/auth/authHandlers";

export async function updateBidImpl(user: {
  emailId: string;
  bidAmount: string;
  bidDescription: string;
  projectId: string;
}): Promise<{
  status: number;
  message: any;
}> {
  try {
    await connectDB("users");

    const emailId = decodeString(user?.emailId);
    if (!emailId) return { status: 401, message: userEnums?.USER_NOT_FOUND };

    const userData = await userModel.findOne({ emailId });
    if (!userData) return { status: 404, message: userEnums.USER_NOT_FOUND };

    const jobPost = await projectModel.findOne({ id: user?.projectId });
    if (!jobPost) return { status: 404, message: responseEnums?.ERROR };

    let bids = jobPost?.bids ?? [];
    const existingBidIndex = bids.findIndex(
      (bid: any) => bid.freelancerEmail === emailId
    );

    if (existingBidIndex !== -1) {
      bids[existingBidIndex].bidAmount = parseInt(user?.bidAmount);
      bids[existingBidIndex].coverLetter = user?.bidDescription;
    } else {
      const bidData = {
        freelancerEmail: emailId,
        bidAmount: parseInt(user?.bidAmount),
        coverLetter: user?.bidDescription,
        status: BID_STATUS_ENUM?.PENDING,
        bidDate: new Date(),
        profile: userData?.profile,
        name: userData?.firstName + " "+(userData?.lastName ?? ""),
        read:0
      };
      bids.push(bidData);
    }

    await projectModel.updateOne({ id: jobPost?.id }, { $set: { bids } });

    await clientModel.updateOne(
      { emailId: jobPost.clientEmail, "postedProjects.id": jobPost.id },
      { $set: { "postedProjects.$.bids": bids } }
    );

    return { status: 200, message: responseEnums?.SUCCESS };
  } catch (error) {
    return { status: 500, message: responseEnums?.ERROR };
  }
}
