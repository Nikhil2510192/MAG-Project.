import express from "express";
import { RegisterUser, login, logout,getUserBasicInfo } from "../controllers/userControllers.js"; 
import { isAuthenticated as authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/register", RegisterUser); //tested
router.post("/login", login);   //tested
router.post("/logout", logout); //tested
router.get("/userInfo", authenticate, getUserBasicInfo);


export default router;