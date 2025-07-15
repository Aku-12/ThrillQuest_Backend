const Guide = require("../../models/guidesmodel");

// CREATE Guide
exports.createGuide = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ success: false, message: "Request body is missing or invalid" });
    }

    const {
      name,
      email,
      specialties,
      experience,
      assignedTours,
      status,
    } = req.body;

    const guide = new Guide({
      name,
      email,
      specialties,
      experience,
      assignedTours,
      status,
    });

    await guide.save();

    res.status(201).json({
      success: true,
      message: "Guide created successfully",
      guide,
    });
  } catch (error) {
    console.error("Create guide error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// GET All Guides with Search, Filter, Pagination
exports.getGuides = async (req, res) => {
  try {
    const {
      search = "",       // ?search=alex
      status,            // ?status=Available
      page = 1,          // ?page=1
      limit = 10,        // ?limit=10
    } = req.query;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialties: { $regex: search, $options: "i" } },
      ],
    };

    if (status) query.status = status;

    const guides = await Guide.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Guide.countDocuments(query);

    res.json({
      success: true,
      data: guides,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get guides error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET Single Guide by ID
exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }

    res.json({ success: true, data: guide });
  } catch (error) {
    console.error("Get guide by ID error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Guide
exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      specialties,
      experience,
      assignedTours,
      status,
    } = req.body;

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }

    const updatedData = {
      name,
      email,
      specialties,
      experience,
      assignedTours,
      status,
    };

    const updatedGuide = await Guide.findByIdAndUpdate(id, updatedData, { new: true });

    res.json({
      success: true,
      message: "Guide updated successfully",
      guide: updatedGuide,
    });
  } catch (error) {
    console.error("Update guide error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE Guide
exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Guide.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }

    res.json({ success: true, message: "Guide deleted successfully" });
  } catch (error) {
    console.error("Delete guide error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// POST /api/guides/:id/rate
exports.rateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5" });
    }

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }

    guide.ratings.push(rating);
    await guide.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
      averageRating: guide.averageRating,
      guide,
    });
  } catch (error) {
    console.error("Rate guide error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

