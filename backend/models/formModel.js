import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {  
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    updatetype: {
      type: String,
      required: [true, "Update type is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    challenges: {
      type: String,
      trim: true,
    },
    tag: {
      type: String,
      trim: true,
    },
    links: {
      type: String,
      trim: true,
    },
    CTA: {
      type: String,
      trim: true,
    },
    hashtags: {
      type: String,
      trim: true,
    },
    other: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const Form = mongoose.model("Form", formSchema);

export default Form;
