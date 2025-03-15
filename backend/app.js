const express = require("express");
const cors = require("cors"); // Import cors
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "50mb" }));
app.use(express.static(`${__dirname}/public`));

const userRouter = require("./routes/userRoutes");
const DB = process.env.DATABASE_URL;

// Connect to MongoDB
mongoose.connect(DB).then(async (conn) => {
  console.log("DB connected ");
  const dbName = conn.connection.name;
  console.log("Using Database:", dbName);
});

// Routes
app.use("/api/users", userRouter);

module.exports = app;
