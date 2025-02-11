import mongoose, { models, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    userId: { type: String, required: true },
    commentText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    userId: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String, default: null }],
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const postModel = models.posts || mongoose.model("posts", postSchema);

export default postModel;
