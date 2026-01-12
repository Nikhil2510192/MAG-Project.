import express from "express";
import { 
  SaveForm, 
  saveGenPost,
  savePastPost, 
  saveLikedPost,
  generatePostController
} from "../controllers/PostControllers.js"; 
import { isAuthenticated as authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();


router.use(authenticate);


router.post("/save-form", SaveForm);
router.post("/generate-post", saveGenPost);
router.post("/past-posts", savePastPost);
router.post("/liked-posts", saveLikedPost);
router.post("/generate-linkedin-post", generatePostController);

export default router;