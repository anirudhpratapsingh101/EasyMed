const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json({ limit: "50mb" }));
app.use(express.static(`${__dirname}/public`));
const userRouter = require("./routes/userRoutes");
const DB = process.env.DATABASE_URL;
mongoose.connect(DB).then(async (conn) => {
  console.log("DB connected ");
  const dbName = conn.connection.name;
  console.log("Using Database:", dbName);
});

app.use("/api/users", userRouter);

module.exports = app;
