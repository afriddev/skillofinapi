import mongoose, { models, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    emailId: { type: String, required: true },
    commentText: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const blogSchema = new Schema(
  {
    emailId: { type: String, required: true },
    id: { type: String, required: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    profile: { type: String, required: false, default: null },
    image: {
      type: String,
      required: false,
      default: null,
    },
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    name:{type:String,required:false}
  },
  { versionKey: false, timestamps: true }
);

const blogModel = models.allBlogs || mongoose.model("allBlogs", blogSchema);

export default blogModel;
