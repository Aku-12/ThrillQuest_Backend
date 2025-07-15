const Booking = require("../../models/bookingsModel");
const Activity = require("../../models/activityModel");

// CREATE Booking
exports.createBooking = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body is missing" });
    }

    const { activityId, customerName, guideName, tourDate } = req.body;

    // Validate input
    if (!activityId || !customerName || !guideName || !tourDate) { 
      console.log("req.body", req.body)
      return res.status(400).json({
        success: false,
        message: "Missing required fields: activityId, customerName, guideName, or tourDate",
      });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    const userId = req.user._id;
    const newBooking = new Booking({
      activity: activityId,
      customerName,
      guideName,
      tourDate,
      userId
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET All Bookings with optional filter & pagination
exports.getBookings = async (req, res) => {
  try {
    const {
      search = "",        // ?search=Ram
      paymentStatus,      // ?paymentStatus=Paid
      bookingStatus,      // ?bookingStatus=Completed
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      $and: [
        {
          $or: [
            { customerName: { $regex: search, $options: "i" } },
            { guideName: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    if (paymentStatus) query.$and.push({ paymentStatus });
    if (bookingStatus) query.$and.push({ bookingStatus });

    const bookings = await Booking.find(query)
      .populate("activity", "name images location price duration") // populate activity details
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET Single Booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("activity");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const {
      customerName,
      guideName,
      tourDate,
      paymentStatus,
      bookingStatus,
    } = req.body;

    booking.customerName = customerName ?? booking.customerName;
    booking.guideName = guideName ?? booking.guideName;
    booking.tourDate = tourDate ?? booking.tourDate;
    booking.paymentStatus = paymentStatus ?? booking.paymentStatus;
    booking.bookingStatus = bookingStatus ?? booking.bookingStatus;

    const updated = await booking.save();

    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE Booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}; 

// GET Bookings of logged-in user
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate("activity", "name images location price duration") 
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

