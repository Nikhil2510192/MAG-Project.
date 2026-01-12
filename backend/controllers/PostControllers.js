import mongoose from "mongoose";
import Form from "../models/formModel.js"; 
import GenPost from "../models/genPostModel.js"; 
import PastPost from "../models/PastPostModel.js";
import LikedPost from "../models/likedPostModel.js";
import { generateLinkedInPost } from "../utils/aiService.js";
import { saveToVectorDB, saveToVectorDB2 } from "../utils/vectordb.js";

export const SaveForm = async (req, res) => {
  try {
    const { 
      role, updatetype, content, challenges, 
      tag, links, CTA, hashtags, other
    } = req.body;
    const userId = req.user.id; // Keep as ObjectId, not Number
   if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required",
        });
    }
    const newForm = new Form({
      userId,
      role,
      updatetype,
      content,
      challenges,
      tag,
      links,
      CTA,
      hashtags,
      other
    });

    // 3. Save to MongoDB
    const savedForm = await newForm.save();

    // 4. Return success response
    return res.status(201).json({
      success: true,
      message: "Form entry created successfully",
      data: savedForm,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: messages,
      });
    }
    console.error("Error in savingform:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};





export const saveGenPost = async (req, res) => {
  try {
    // 1. Extract data from the request body
    const { formId, genPost, liked, feedback } = req.body;

    // 2. Get User ID from the middleware (populated by your JWT logic)
    const userId = req.user.id;

    // 3. Validation: Ensure required fields are present (safety check)
   if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Form ID format",
      });
    }
    if (!genPost) {
      return res.status(400).json({
        success: false,
        message: "post content is required",
      });
    }

    // 4. Create and Save the document
    const newGenPost = new GenPost({
      userId,       
      formId,
      genPost,        
      liked,
      feedback
    });

    const savedPost = await newGenPost.save();

    await saveToVectorDB2({
    text: `${genPost}\nFeedback: ${feedback || ""}`,
    userId,
    mongoDocId: savedPost._id,
    });

    // 5. Return success
    return res.status(201).json({
      success: true,
      message: "Generated post saved successfully",
      data: savedPost,
    });

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: messages,
      });
    }

    // Handle general server errors
    console.error("Error saving generated post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};






export const savePastPost = async (req, res) => {
  try {
    const { formId, pastPost } = req.body;
    const userId = req.user.id; // From JWT middleware

    if (!formId || !pastPost) {
      return res.status(400).json({ success: false, message: "Form ID and Post content are required" });
    }

    const newPastPost = await PastPost.create({
      userId,
      formId,
      pastPost,
    });

    await saveToVectorDB({
    text: pastPost,
    userId,
    mongoDocId: newPastPost._id,
    });

    return res.status(201).json({
      success: true,
      message: "Post added to history",
      data: newPastPost,
    });
  } catch (error) {
    console.error("PastPost Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};







export const saveLikedPost = async (req, res) => {
  try {
    const { formId, likedPost } = req.body;
    const userId = req.user.id;

    if (!formId || !likedPost) {
      return res.status(400).json({ success: false, message: "Form ID and Liked content are required" });
    }

    const newLikedPost = await LikedPost.create({
      userId,
      formId,
      likedPost,
    });
    return res.status(201).json({
      success: true,
      message: "Post saved to liked collection",
      data: newLikedPost,
    });
  } catch (error) {
    console.error("LikedPost Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const generatePostController = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { formId, pastPostId, likedPostId } = req.body;

    if (!formId || !pastPostId || !likedPostId) {
      return res.status(400).json({
        success: false,
        message: "Form ID, Past Post ID, and Liked Post ID are required",
      });
    }

    // 1. Fetch DB records
    const pastPost = await PastPost.findOne({
      _id: pastPostId,
      userId,
    });

    const likedPost = await LikedPost.findOne({
      _id: likedPostId,
      userId,
    });

    if (!pastPost || !likedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 2. Call AI service
    const generatedPost = await generateLinkedInPost({
      userId,
      formId,
      currentPastPost: pastPost.pastPost,
      currentLikedPost: likedPost.likedPost,
    });

    // 3. Return response
    return res.status(200).json({
      success: true,
      generatedPost,
    });
  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
