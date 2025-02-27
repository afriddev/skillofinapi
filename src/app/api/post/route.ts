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

    const emailId = decodeString(request?.emailId);

    try {
      await connectDB("users");

      const userData = await userModel?.findOne({ emailId });
      const userProfile = userData?.profile || "";

      if (request?.edit) {
        try {
          const postData = await postModel?.findOne({
            emailId,
            id: request?.id,
          });
          await postModel?.updateOne(
            {
              emailId,
              id: request?.id,
            },
            {
              $set: {
                title: request?.title,
                content: request?.content,
                image: request?.image ? request?.image : postData?.image,
              },
            }
          );

          const myPosts = userData?.posts ?? [];

          for (const post of myPosts) {
            post.profile = userProfile;
            if (post.id === request?.id) {
              post.title = request?.title;
              post.content = request?.content;
              post.image = request?.image ? request?.image : post?.image;
            }
          }

          await userModel?.updateOne({ emailId }, { $set: { posts: myPosts } });

          await postModel.updateMany(
            { emailId },
            { $set: { profile: userProfile } }
          );

          const posts = await postModel.find().sort({ createdAt: -1 });

          return NextResponse.json(
            {
              message: responseEnums?.SUCCESS,
              posts,
            },
            { status: 200 }
          );
        } catch (e) {
          return NextResponse.json(
            {
              message: responseEnums?.SUCCESS,
            },
            {
              status: 400,
            }
          );
        }
      }

      const postData = await postModel.create({
        emailId,
        title: request?.title,
        content: request?.content,
        profile: userProfile,
        id: getAUthToken(20),
        image: request?.image ?? null,
        name:
          userData?.firstName +
          (userData?.lastName ? " " + userData?.lastName : ""),
      });

      const myPosts = userData?.posts ?? [];
      myPosts.unshift(postData);

      for (const post of myPosts) {
        post.profile = userProfile;
      }

      await userModel?.updateOne({ emailId }, { $set: { posts: myPosts } });

      await postModel.updateMany(
        { emailId },
        { $set: { profile: userProfile } }
      );

      const posts = await postModel.find().sort({ createdAt: -1 });

      return NextResponse.json(
        {
          message: responseEnums?.SUCCESS,
          posts,
        },
        { status: 200 }
      );
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { message: responseEnums?.ERROR },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: exceptionEnums.SERVER_ERROR },
      { status: 500 }
    );
  }
}
