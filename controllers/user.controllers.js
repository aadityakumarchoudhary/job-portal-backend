import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "Something is missing", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email.", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ fullname, email, phoneNumber, password: hashedPassword, role });

    return res.status(201).json({ message: "Account created successfully", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Something is missing", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password", success: false });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Incorrect email or password.", success: false });
    }

    if (role !== user.role) {
      return res.status(400).json({ message: "Account doesn't exist with current role", success: false });
    }

    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    // ✅ FIXED COOKIE — sameSite "none" + secure for cross-domain (Vercel ↔ Render)
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",  // ✅ was "strict" — this was the main bug
        secure: true,      // ✅ required when sameSite is "none"
      })
      .json({ message: `Welcome back ${user.fullname}`, user: safeUser, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    // ✅ FIXED — must match login cookie options to properly clear cross-domain
    return res
      .status(200)
      .cookie("token", "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const skillsArray = skills ? skills.split(",") : [];
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    // ✅ Handle profile photo upload to Cloudinary
    if (req.file) {
      const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      user.profile.profilePhoto = cloudResponse.secure_url;
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    await user.save();

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({ message: "Profile updated successfully.", user: safeUser, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


