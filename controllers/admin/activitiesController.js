// POST Route for Admin to add an activity
const activityModel = require("../../models/activityModel")

exports.createActivity = async(req, res) => {
    try {
    const { name, description } = req.body;

console.log(req.body)
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const newActivity = new activityModel({
      name,
      description,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    await newActivity.save();

    res.json({
      success: true,
      message: "Activity added successfully",
      activity: newActivity,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// ✅ GET Route for Admin to fetch all activities
exports.getActivity = async(req, res) =>{
    try {
    const activities = await activityModel.find();
    res.json({ success: true, activities });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

exports.deleteActivity = async(req, res) => {
  try {
    console.log(req.params)
    const { id } = req.params.id;

    const deletedActivity = await activityModel.findByIdAndDelete(id);

    if (!deletedActivity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}


