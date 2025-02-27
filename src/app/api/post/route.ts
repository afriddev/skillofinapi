"use server";
import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import postModel from "@/app/mongodb/models/postModel";
import userModel from "@/app/mongodb/models/userModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { getAUthToken } from "@/app/utils/auth/cookieHandlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    if (!request.emailId) {
      return NextResponse.json(
        { message: exceptionEnums.BAD_REQUEST },
        { status: 400 }
      );
    }
    const emailId = decodeString(request.emailId);
    await connectDB("users");
    const userData = await userModel.findOne({ emailId });
    const userProfile = userData?.profile || "";

    if (request?.edit) {
      const postData = await postModel.findOne({ emailId, id: request.id });
      await postModel.updateOne(
        { emailId, id: request.id },
        {
          $set: {
            title: request.title,
            content: request.content,
            image: request.image ? request.image : postData.image,
          },
        }
      );
      userData.posts = userData.posts.map((post: any) =>
        post.id === request.id ? { ...post, ...request } : post
      );
      await userModel.updateOne(
        { emailId },
        { $set: { posts: userData.posts } }
      );
    } else if (request?.create) {
      const postData = await postModel.create({
        emailId,
        title: request.title,
        content: request.content,
        profile: userProfile,
        id: getAUthToken(20),
        image: request.image ?? null,
        name:
          userData?.firstName +
          (userData?.lastName ? " " + userData?.lastName : ""),
      });
      userData.posts.unshift(postData);
      await userModel.updateOne(
        { emailId },
        { $set: { posts: userData.posts } }
      );
    } else if (request?.like) {
      const postData = await postModel.findOne({ id: request.id });

      const isLiked = postData.likes.includes(request?.userEmail);

      await postModel.updateOne(
        { id: request.id },
        {
          $set: {
            likes: isLiked
              ? postData.likes.filter((id: any) => id !== request?.userEmail)
              : [...postData.likes, request?.userEmail],
          },
        }
      );

      const updatedUser = await userModel.findOneAndUpdate(
        { emailId: postData?.emailId, "posts.id": String(request.id) },
        {
          $set: {
            "posts.$.likes": isLiked
              ? postData.likes.filter((id: any) => id !== request?.userEmail)
              : [...postData.likes, request?.userEmail],
          },
        },
        { new: true }
      );
    } else if (request?.comment) {
      const postData = await postModel.findOne({ id: request.id });
      if (request?.deleteComment) {
        postData.comments.splice(request?.commentIndex, 1);
        await postData.save();

        await userModel.updateOne(
          { emailId: postData.emailId, "posts.id": request?.id },
          { $set: { "posts.$.comments": postData.comments } }
        );

        return NextResponse.json(
          { message: responseEnums?.SUCCESS },
          {
            status: 200,
          }
        );
      }

      const newComment = {
        name: request?.name,
        commentText: request.commentText,
        profile: request?.profile,
        emailId: request?.emailId,
      };

      await postModel.updateOne(
        { id: request.id },
        { $push: { comments: newComment } }
      );

      await userModel.updateOne(
        { emailId: postData?.emailId, "posts.id": request.id },
        { $push: { "posts.$.comments": newComment } }
      );
    }

    const posts = await postModel.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: responseEnums.SUCCESS, posts },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
