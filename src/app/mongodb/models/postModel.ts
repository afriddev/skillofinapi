import mongoose, { models, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    emailId: { type: String, required: true },
    commentText: { type: String, required: true },
  },
  { _id: false,timestamps: true }
);

const postSchema = new Schema(
  {
    emailId: { type: String, required: true },
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    profile: { type: String, required: true },
    images: [{ type: String, default: null }],
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    
  },
  { versionKey: false, timestamps: true }
);

const postModel = models.allPosts || mongoose.model("allPosts", postSchema);

export default postModel;
