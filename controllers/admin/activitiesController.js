const Activity = require("../../models/activityModel");

// CREATE Activity
exports.createActivity = async (req, res) => {
  try {
    const {
      name, 
      location,
      price,
      duration,
      difficulty,
      bookings,
      rating,
      status,
    } = req.body;

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);

    const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const activity = new Activity({
      name,
      location,
      price,
      duration,
      difficulty,
      bookings,
      rating,
      status,
      images: imagePaths,
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET All Activities with Search, Filter, Pagination
exports.getActivities = async (req, res) => {
  try {
    const {
      search = "",            // ?search=paragliding
      difficulty,             // ?difficulty=Beginner
      status,                 // ?status=Active
      page = 1,               // ?page=2
      limit = 10              // ?limit=10
    } = req.query;

    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } }
          ]
        },
      ],
    };

    if (difficulty) query.$and.push({ difficulty });
    if (status) query.$and.push({ status });

    const activities = await Activity.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET Single Activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    console.error("Get activity by ID error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Activity
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const body = req.body || {};
    const {
      name,
      location,
      price,
      duration,
      difficulty,
      bookings,
      rating,
      status,
      existingImages,
    } = body;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    // Parse existingImages (from frontend) safely
    let existingImagesArray = [];
    if (existingImages) {
      try {
        existingImagesArray = JSON.parse(existingImages);
      } catch (error) {
        console.error("Error parsing existingImages JSON:", error);
        return res.status(400).json({ success: false, message: "Invalid existingImages format" });
      }
    }

    // Get new uploaded images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedData = {
      name,
      location,
      price,
      duration,
      difficulty,
      bookings,
      rating,
      status,
      images: existingImagesArray.concat(newImages),
    };

    const updatedActivity = await Activity.findByIdAndUpdate(id, updatedData, { new: true });

    res.json({
      success: true,
      message: "Activity updated successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Update activity error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// DELETE Activity
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Activity.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
