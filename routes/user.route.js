import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controllers.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// Test endpoint for frontend-backend connection
router.get("/test", (req, res) => {
  res.status(200).json({
    message: "Frontend-Backend connection successful!",
    timestamp: new Date().toISOString(),
    success: true
  });
});

//router.route("/register").post(register);
router.post("/register",register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, updateProfile);


export default router;