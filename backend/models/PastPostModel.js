import mongoose from "mongoose";

const pastPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: [true, "Form ID is required"],
    },
    pastPost: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const PastPost = mongoose.model("PastPost", pastPostSchema);

export default PastPost;

