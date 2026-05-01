import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controllers.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({ message: "Frontend-Backend connection successful!", success: true });
});

router.post("/register", register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, upload.single("file"), updateProfile);

export default router;