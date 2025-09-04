  import { generateToken } from "../lib/utils.js";
  import User from "../models/User.js";
  import bcrypt from "bcrypt";
  import cloudinary from "../lib/cloudinary.js";

  //signup a user
  export const signup = async (req, res) => { // Added req and res parameters
    const { fullName, email, password, bio } = req.body;
    try {
      if (!fullName || !email || !password || !bio) {
        return res.json({ success: false, message: "All fields are required" });
      }
      const user = await User.findOne({ email });
      if (user) {
        return res.json({ success: false, message: "Account already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        bio,
      });
      const token = generateToken(newUser._id);
      res.json({ // Corrected from 'response' to 'res'
        success: true,
        userData: newUser,
        token,
        message: "Account created successfully",
      });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message }); // Corrected from 'response' to 'res'
    }
  };

  //controller to login a user
  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userData = await User.findOne({ email });

      // Handle case where user is not found
      if (!userData) {
        return res.json({ success: false, message: "Invalid Credentials" });
      }

      // Use the correct variable name: isPasswordMatch
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
      
      // Check if passwords match
      if (!isPasswordMatch) {
        return res.json({ success: false, message: "Invalid Credentials" });
      }

      const token = generateToken(userData._id); // Correctly using userData
      res.json({
        success: true,
        userData: userData, // Correctly using userData
        token,
        message: "Logged in successfully", // Correct message for login
      });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message }); // Corrected from 'response' to 'res' and added .message
    }
  };

  //controller to check if user is authenticated
  export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user }); // Corrected 'jdon' to 'json'
  };

  //controller to update user profile
  export const updateProfile = async (req, res) => {
    try {
      const { profilePic, bio, fullName } = req.body;

      const userId = req.user._id;
      let updatedUser;

      if (!profilePic) {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { bio, fullName },
          { new: true }
        );
      } else {
        const upload = await cloudinary.uploader.upload(profilePic);

        updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePic: upload.secure_url, bio, fullName },
          { new: true }
        );
      }
      res.json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message,
      });
    }
  };
