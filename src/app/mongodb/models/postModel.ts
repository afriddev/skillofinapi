import mongoose, { models, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    emailId: { type: String, required: true },
    commentText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    emailId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String, default: null }],
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const postModel = models.allPosts || mongoose.model("allPosts", postSchema);

export default postModel;
