const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const createAccount = async (req, res) => {
  try {
    const { fName, lName, email, phoneNo, role, password, profileImage } =
      req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(403).json({
        success: false,
        message: "Account already exists with this email! Try logging in.",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      fName,
      lName,
      email,
      phoneNo,
      role,
      password: hashedPassword,
      profileImage: profileImage || "",
    });

    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      fName: newUser.fName,
      lName: newUser.lName,
      email: newUser.email,
      phoneNo: newUser.phoneNo,
      role: newUser.role,
      profileImage: newUser.profileImage,
    };

    res.status(201).json({
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Account does not exist. Please create one!",
      });
    }

    const isMatch = await bcryptjs.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const payload = {
      userId: existingUser._id,
      role: existingUser.role,
      email: existingUser.email,
      fName: existingUser.fName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Successfully logged in.",
      data: {
        _id: existingUser._id,
        role: existingUser.role,
        email: existingUser.email,
        fName: existingUser.fName,
        lName: existingUser.lName,
        phoneNo: existingUser.phoneNo,
        profileImage: existingUser.profileImage,
        favorites: existingUser.favorites,
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
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

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

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const { fName, lName, email, phoneNo } = req.body;

    if (fName) userToUpdate.fName = fName;
    if (lName) userToUpdate.lName = lName;
    if (email) userToUpdate.email = email;
    if (phoneNo) userToUpdate.phoneNo = phoneNo;

    if (req.file) {
      userToUpdate.profileImage = req.file.path;
    }

    const updatedUser = await userToUpdate.save();

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
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile.",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new passwords are required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

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

const addFavoriteBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { activityId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid acitivity ID." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.favorites.includes(activityId)) {
      user.favorites.push(activityId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Activity added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFavoriteBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { activityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking ID." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== activityId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Booking removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Favorites fetched successfully",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAccount,
  login,
  getUserProfile,
  changePassword,
  updateUserProfile,
  addFavoriteBooking,
  removeFavoriteBooking,
  getMyFavorites,
};
