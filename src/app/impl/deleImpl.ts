import { responseEnums } from "@/app/enums/responseEnums";
import projectModel from "../mongodb/models/projectModel";
import clientModel from "../mongodb/models/clientModel";
import { decodeString } from "../utils/auth/authHandlers";
import postModel from "../mongodb/models/postModel";
import userModel from "../mongodb/models/userModel";

interface DeleteRequest {
  emailId: string;
  method: string;
  id: string;
}

export async function deleteImpl(
  request: DeleteRequest
): Promise<{ status: number; message: any }> {
  const emailId = decodeString(request?.emailId);
  try {
    if (request.method === "job") {
      await projectModel.findOneAndDelete({id:request?.id});

      await clientModel.findOneAndUpdate(
        { emailId: emailId },
        { $pull: { postedProjects: {
            id:request.id
        } } },
        { new: true }
      );

      return { message: responseEnums?.SUCCESS, status: 200 };
    }
    else if (request.method === "post") {
      await postModel.findOneAndDelete({id:request?.id});

      await userModel.findOneAndUpdate(
        { emailId: emailId },
        { $pull: { posts: {
            id:request.id
        } } },
        { new: true }
      );

      return { message: responseEnums?.SUCCESS, status: 200 };
    }
    return { message: responseEnums?.SUCCESS, status: 200 };
  } catch (e) {
    return { message: responseEnums?.ERROR, status: 400 };
  }
}
