const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createAccount = async (req, res) => {
  try {
    const { fName, lName, email, phoneNo, role, password, profileImage } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(403).json({
        success: false,
        message: "Account already exists with this email! Try logging in..",
      });

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      fName,
      lName,
      email,
      phoneNo,
      role,
      password: hashedPassword,
      profileImage: profileImage || '', // Handle optional profile image
    });

    await newUser.save();

    // SECURITY FIX: Do not send the full 'newUser' object back.
    // Create a sanitized response that omits the password.
    const userResponse = {
        _id: newUser._id,
        fName: newUser.fName,
        lName: newUser.lName,
        email: newUser.email,
        phoneNo: newUser.phoneNo,
        role: newUser.role,
        profileImage: newUser.profileImage
    };

    res.status(201).json({ // Use 201 Created for new resources
      success: true,
      message: "Account successfully created!",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    // INSECURE: Taking user ID from the URL parameter.
    const { userId } = req.params;

    // Optional: You could add a check to see if the user is an admin
    // or if the userId in the token matches the userId in the params.
    // if (req.user.role !== 'admin' && req.user.userId !== userId) {
    //   return res.status(403).json({ success: false, message: "Forbidden: You can only update your own profile." });
    // }

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Get the text fields to update from the request body.
    const { fName, lName,email, phoneNo } = req.body;

    // Update the user's fields if new values are provided.
    if (fName) userToUpdate.fName = fName;
    if (lName) userToUpdate.lName = lName;
    if (email) userToUpdate.email = email;
    if (phoneNo) userToUpdate.phoneNo = phoneNo;

    // Check if a new file was uploaded via multer.
    if (req.file) {
      // The path to the file, e.g., 'uploads/profileImage-...'
      userToUpdate.profileImage = req.file.path;
    }

    const updatedUser = await userToUpdate.save();

    // Create a sanitized response object (omitting the password).
    const userResponse = {
      _id: updatedUser._id,
      fName: updatedUser.fName,
      lName: updatedUser.lName,
      email: updatedUser.email,
      phoneNo: updatedUser.phoneNo,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: userResponse,
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile.",
      error: error.message,
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(401).json({
        success: false,
        message: "Account does not exist. Please create one!",
      });

    const isMatch = await bcryptjs.compare(password, existingUser.password);

    if (!isMatch)
      return res.status(401).json({ // Use 401 Unauthorized for bad credentials
        success: false,
        message: "Invalid Credentials",
      });

    const payload = {
      userId: existingUser._id,
      role: existingUser.role,
      email: existingUser.email,
      fName: existingUser.fName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // DATA CONSISTENCY FIX: Send the full user profile data on login
    // so the Flutter app has all the necessary info immediately.
    res.status(200).json({
      success: true,
      message: "Successfully logged in..",
      data: {
        _id: existingUser._id,
        role: existingUser.role,
        email: existingUser.email,
        fName: existingUser.fName,
        lName: existingUser.lName,
        phoneNo: existingUser.phoneNo,
        profileImage: existingUser.profileImage,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // This line is CORRECT, but it requires the auth middleware to run first.
    const userId = req.user._id; 
    console.log(userId)

    const user = await User.findById(userId).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Both current and new passwords are required." });
    }

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const isMatch = await bcryptjs.compare(currentPassword, user.password);

    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });

    user.password = await bcryptjs.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createAccount, login, getUserProfile, changePassword, updateUserProfile};
