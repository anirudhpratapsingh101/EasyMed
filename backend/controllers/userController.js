const User = require("../models/userModel");

async function createGeoIndex() {
  try {
    await User.collection.createIndex({ location: "2dsphere" });
    console.log("✅ Geospatial index created successfully!");
  } catch (err) {
    console.error("❌ Error creating index:", err);
  }
}

createGeoIndex();

exports.getAllUsers = async (req, res) => {
  const users = await User.find();

  if (users.length === 0) {
    console.log("No users found in the database");
  }

  res.status(200).json({
    message: "Users retrieved successfully",
    data: {
      length: users.length,
      users,
    },
  });
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: "success",
      message: "User created successfully!",
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to create user",
      error: error.message,
    });
  }
};
exports.updateMedicines = async (req, res) => {
  const { userId, medicines } = req.body;

  if (!userId || !Array.isArray(medicines)) {
    return res.status(400).json({
      status: "fail",
      message:
        "Invalid input. Provide a valid userId and an array of medicines.",
    });
  }

  // Find the user and update their medicines array
  const user = await User.findByIdAndUpdate(
    userId,
    { medicines }, // Directly replace the array
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ status: "fail", message: "User not found" });
  }

  res.status(200).json({
    status: "success",
    message: "Medicines replaced successfully",
    data: user.medicines,
  });
};
exports.getMedicines = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance, medicines } = req.query;

    // Validate required parameters
    if (!longitude || !latitude || !maxDistance || !medicines) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const maxDist = parseFloat(maxDistance) * 1000; // Convert km to meters
    const medicineList = medicines.split(",").map((med) => med.trim()); // Convert to array

    // Query to find users with geospatial filtering and medicine matching
    const users = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [long, lat] },
          distanceField: "distance",
          maxDistance: maxDist,
          spherical: true,
        },
      },
      {
        $match: {
          "medicines.name": { $in: medicineList }, // Users must have at least one of the requested medicines
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          pharmacyName: 1,
          location: 1,
          distance: 1,
          medicines: {
            $filter: {
              input: "$medicines",
              as: "med",
              cond: { $in: ["$$med.name", medicineList] }, // Return only matching medicines
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users with medicines:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUserLocation = async (req, res) => {
  try {
    const { userId } = req.params; // Get user ID from URL parameters
    const { coordinates } = req.body; // Get new coordinates from request body

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        status: "error",
        message: "Invalid location format. Provide [longitude, latitude].",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { location: { type: "Point", coordinates } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User location updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to update user location",
      error: error.message,
    });
  }
};
