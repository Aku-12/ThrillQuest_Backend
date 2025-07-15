const mongoose = require("mongoose");

const guidesModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    specialties: { type: [String], default: [] },
    experience: { type: Number, required: true },
    assignedTours: { type: Number, default: 0 },
    ratings: { type: [Number], default: [] }, // array of individual ratings
    status: {
      type: String,
      enum: ["Available", "On Break", "Unavailable"],
      default: "Available",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for average rating
guidesModel.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const total = this.ratings.reduce((sum, r) => sum + r, 0);
  return parseFloat((total / this.ratings.length).toFixed(1));
});

module.exports = mongoose.model("Guide", guidesModel);
