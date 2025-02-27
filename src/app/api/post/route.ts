"use server";
import { exceptionEnums, responseEnums } from "@/app/enums/responseEnums";
import connectDB from "@/app/mongodb/connectors/connectDB";
import postModel from "@/app/mongodb/models/postModel";
import userModel from "@/app/mongodb/models/userModel";
import { decodeString } from "@/app/utils/auth/authHandlers";
import { getAUthToken } from "@/app/utils/auth/cookieHandlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  ahdashdashdaskhdkla;
  asdkashldsakd;
  dasldjlka;
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

    // Handle Editing a Post
    if (request.edit) {
      const postData = await postModel.findOne({ emailId, id: request.id });
      if (!postData) {
        return NextResponse.json(
          { message: "Post not found" },
          { status: 404 }
        );
      }
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
    }

    // Handle Creating a Post
    else if (request.create) {
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
    } else if (request.like) {
      const postData = await postModel.findOne({ id: request.id });
      if (!postData)
        return NextResponse.json(
          { message: "Post not found" },
          { status: 404 }
        );

      const isLiked = postData.likes.includes(emailId);

      // Update postModel
      await postModel.updateOne(
        { id: request.id },
        {
          $set: {
            likes: isLiked
              ? postData.likes.filter((id) => id !== emailId)
              : [...postData.likes, emailId],
          },
        }
      );

      // Update userModel
      await userModel.updateOne(
        { emailId },
        isLiked
          ? { $pull: { likedPosts: request.id } } // Remove from liked posts if unliked
          : { $addToSet: { likedPosts: request.id } } // Add to liked posts if liked
      );
    }

    // Handle Adding a Comment
    else if (request.comment) {
      const postData = await postModel.findOne({ id: request.id });
      if (!postData)
        return NextResponse.json(
          { message: "Post not found" },
          { status: 404 }
        );

      const newComment = {
        name: userData.firstName + " " + userData.lastName,
        commentText: request.comment,
        profile: userProfile,
      };

      // Update postModel
      await postModel.updateOne(
        { id: request.id },
        { $push: { comments: newComment } }
      );

      // Update userModel to track commented posts
      await userModel.updateOne(
        { emailId },
        { $addToSet: { commentedPosts: request.id } } // Prevents duplicate entries
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
