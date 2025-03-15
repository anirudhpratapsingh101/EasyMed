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

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: `No user found with ID: ${id}`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the user",
    });
  }
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
    if (!longitude || !latitude || !maxDistance) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const maxDist = parseFloat(maxDistance) * 1000; // Convert km to meters
    const medicineList = medicines
      ? medicines.split(",").map((med) => med.trim())
      : []; // Convert to array if provided

    // Base query for geo filtering
    let query = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [long, lat] },
          distanceField: "distance",
          maxDistance: maxDist,
          spherical: true,
        },
      },
    ];

    // If medicines are provided, add filtering condition
    if (medicineList.length > 0) {
      query.push({
        $match: {
          "medicines.name": {
            $in: medicineList.map((med) => new RegExp("^" + med + "$", "i")),
          }, // Users must have at least one of the requested medicines
        },
      });
    }

    // Add projection to return rel evant fields
    query.push({
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        pharmacyName: 1,
        location: 1,
        distance: 1,
        medicines: medicines
          ? {
              $filter: {
                input: "$medicines",
                as: "med",
                cond: { $in: ["$$med.name", medicineList] }, // Return only matching medicines
              },
            }
          : "$medicines", // If no medicine filter, return all medicines
      },
    });

    const users = await User.aggregate(query);
    console.log(users);

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

exports.updateMe = async (req, res) => {
  try {
    console.log("🔹 Update route hit!", req.body);
    console.log(req);
    const userId = req.user._id; // Get the logged-in user's ID from auth middleware
    // Extract updatable fields
    const { phone, pharmacyName, medicines, longitude, latitude } = req.body;

    // Create an update object dynamically
    let updateFields = {};

    if (phone !== undefined) updateFields.phone = phone;
    if (pharmacyName !== undefined) updateFields.pharmacyName = pharmacyName;
    if (medicines !== undefined) updateFields.medicines = medicines;

    // Validate and parse location if provided
    if (longitude !== undefined && latitude !== undefined) {
      const long = parseFloat(longitude);
      const lat = parseFloat(latitude);

      if (isNaN(long) || isNaN(lat)) {
        return res.status(400).json({
          status: "fail",
          message:
            "Invalid location format. Provide numeric longitude & latitude.",
        });
      }

      updateFields.location = { type: "Point", coordinates: [long, lat] };
    }

    // Ensure updateFields is not empty
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No fields provided for update.",
      });
    }
    console.log("Update Fields", updateFields);
    // Update user details
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found!",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully!",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while updating the profile!",
    });
  }
};

// exports.updateUserLocation = async (req, res) => {
//   try {
//     const { userId } = req.params; // Get user ID from URL parameters
//     const { coordinates } = req.body; // Get new coordinates from request body

//     if (!coordinates || coordinates.length !== 2) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid location format. Provide [longitude, latitude].",
//       });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { location: { type: "Point", coordinates } },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         status: "error",
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "User location updated successfully!",
//       data: updatedUser,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "error",
//       message: "Failed to update user location",
//       error: error.message,
//     });
//   }
// };
