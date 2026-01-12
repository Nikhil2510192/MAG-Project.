import mongoose from "mongoose";

const genPostSchema = new mongoose.Schema(
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
    genPost: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
    },
    liked:{
        type: Boolean,
        required: [true, "Liked status is required"],
    },
    feedback:{
        type: String,
        trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const genPost = mongoose.model("genPost", genPostSchema);

export default genPost;