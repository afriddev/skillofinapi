import { responseEnums } from "@/app/enums/responseEnums";
import projectModel from "../mongodb/models/projectModel";
import clientModel from "../mongodb/models/clientModel";
import { decodeString } from "../utils/auth/authHandlers";

interface DeleteRequest {
  authToken: string;
  method: string;
  id: string;
}

export async function deleteImpl(
  request: DeleteRequest
): Promise<{ status: number; message: any }> {
  const emailId = decodeString(request?.authToken);
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
    return { message: responseEnums?.SUCCESS, status: 200 };
  } catch (e) {
    return { message: responseEnums?.ERROR, status: 400 };
  }
}
