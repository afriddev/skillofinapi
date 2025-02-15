"use server";

import { responseEnums, userEnums } from "../enums/responseEnums";
import connectDB from "../mongodb/connectors/connectDB";
import clientModel, { userRole } from "../mongodb/models/clientModel";
import freelancerModel, {
  LANGUAGE_ENUM,
} from "../mongodb/models/freelancerModel";
import userModel from "../mongodb/models/userModel";
import { decodeString } from "../utils/auth/authHandlers";

export async function updateProfileImpl(user: {
  authToken: string;
  method: string;
  data: any;
}): Promise<{
  status: number;
  message: any;
  data?: any;
}> {
  await connectDB("users");
  const emailId = decodeString(user?.authToken);
  const userData = await userModel.findOne({ emailId });
  if (!userData) {
    return { status: 200, message: userEnums.USER_NOT_FOUND };
  }

  const userAccountModel =
    userData?.role === userRole.FREELANCER ? freelancerModel : clientModel;

  try {
    switch (user?.method) {
      case "profileImage":
        await userModel.updateOne(
          { emailId },
          {
            $set: {
              profile: user?.data?.image,
            },
          }
        );
        break;
      case "online":
        await userModel.updateOne(
          { emailId },
          {
            $set: {
              online: user?.data?.value,
            },
          }
        );
        break;
      case "title":
        if (userData?.role === "CLIENT") {
          break;
        }
        await userAccountModel.updateOne(
          { emailId },
          {
            $set: {
              companyName: user?.data?.headline,
              description: user?.data?.summary,
            },
          }
        );
        break;

      case "costPerHour":
        await userAccountModel.updateOne(
          { emailId },
          {
            $set: {
              hourlyRate: parseFloat(user?.data?.costPerHour),
            },
          }
        );
        break;

      case "skills":
        await userAccountModel.updateOne(
          { emailId },
          {
            $push: {
              skills: {
                $each: user?.data?.skills,
              },
            },
          }
        );
        break;

      case "languages":
        await userAccountModel.updateOne(
          { emailId },
          {
            $push: {
              languages: {
                name: user?.data?.name,
                level:
                  user?.data?.level === "basic"
                    ? LANGUAGE_ENUM?.BASIC
                    : user?.data?.level === "fluent"
                    ? LANGUAGE_ENUM?.FLUENT
                    : user?.data?.level === "intermediate"
                    ? LANGUAGE_ENUM.INTERMEDIATE
                    : LANGUAGE_ENUM?.NATIVE,
              },
            },
          }
        );
      case "project":
        await userAccountModel.updateOne(
          { emailId },
          {
            $push: {
              projects: {
                title: user?.data?.title,
                description: user?.data?.description,
              },
            },
          }
        );
        break;

      case "employment":
        await userAccountModel.updateOne(
          { emailId },
          {
            $push: {
              employmentHistory: {
                companyName: user?.data?.name,
                description: user?.data?.description,

                startDate: user?.data?.fromDate,

                endDate: user?.data?.toDate,
              },
            },
          }
        );
        break;

      case "education":
        await userAccountModel.updateOne(
          { emailId },
          {
            $push: {
              educationHistory: {
                name: user?.data?.name,
                description: user?.data?.description,

                startDate: user?.data?.fromDate,

                endDate: user?.data?.toDate,
              },
            },
          }
        );
        break;
    }
    return {
      status: 200,
      message: responseEnums.SUCCESS,
      data: {
        userData: await userModel.findOne({ emailId }),
        userAccountData: await userAccountModel?.findOne({ emailId }),
      },
    };
  } catch (error) {
    return { status: 200, message: responseEnums.ERROR };
  }
}
