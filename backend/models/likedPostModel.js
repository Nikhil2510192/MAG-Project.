import mongoose from "mongoose";

const LikedPostSchema = new mongoose.Schema(
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
    likedPost: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const LikedPost = mongoose.model("LikedPost", LikedPostSchema);

export default LikedPost;