const User = require('../../models/userModel'); // adjust path as needed

// GET: /api/admin/customers?page=1&limit=10
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default to page 1
        const limit = parseInt(req.query.limit) || 10; // default to 10 records per page
        const skip = (page - 1) * limit;

        // Get total count for pagination info
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        const customers = await User.find({ role: 'customer' })
            .skip(skip)
            .limit(limit)
            .select('-password') // exclude password from response
            .sort({ createdAt: -1 }); // optional: sort by newest first

        res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(totalCustomers / limit),
            totalCustomers,
            customers
        });

    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch customers"
        });
    }
};

module.exports = {
    getAllUsers
};
