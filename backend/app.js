const express = require("express");
const cors = require("cors"); // Import cors
const mongoose = require("mongoose");

const app = express();

// Middleware
const corsOptions = {
  origin: `${process.env.FRONTEND_URL}`,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.static(`${__dirname}/public`));

const userRouter = require("./routes/userRoutes");
const DB = process.env.DATABASE_URL;

// Connect to MongoDB
mongoose.connect(DB).then(async (conn) => {
  console.log("DB connected ");
  await seedUsers(); // Seed the database with users and pharmacies

  const dbName = conn.connection.name;
});
// Routes
app.use("/api/users", userRouter);

module.exports = app;
const User = require("./models/userModel"); // adjust path

// Raipur base coordinates
const RAIPUR_LAT = 21.2514;
const RAIPUR_LNG = 81.6296;

// random jitter around Raipur
function randomNearbyCoordinate(base, range = 0.08) {
  return base + (Math.random() - 0.5) * range; // spread wider
}

// sample medicines
function generateMedicines() {
  const meds = [
    { name: "Paracetamol", price: 20, quantity: 100 },
    { name: "Amoxicillin", price: 50, quantity: 50 },
    { name: "Cetirizine", price: 15, quantity: 200 },
    { name: "Ibuprofen", price: 30, quantity: 75 },
    { name: "Azithromycin", price: 60, quantity: 40 },
    { name: "Cough Syrup", price: 70, quantity: 25 },
    { name: "Vitamin C", price: 120, quantity: 80 },
  ];
  return meds.map((m) => ({
    ...m,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yr ahead
  }));
}

async function seedUsers() {
  try {
    console.log("Seeding users...");
    const sampleUsers = [
      {
        name: "Karan Mehta",
        email: "karan@example.com",
        phone: "9990000021",
        pharmacyName: "WellCare Pharmacy",
      },
      {
        name: "Ananya Kapoor",
        email: "ananya@example.com",
        phone: "9990000022",
        pharmacyName: "MediTrust Pharmacy",
      },
      {
        name: "Raghav Singh",
        email: "raghav@example.com",
        phone: "9990000023",
        pharmacyName: "HealthMart",
      },
      {
        name: "Isha Verma",
        email: "isha@example.com",
        phone: "9990000024",
        pharmacyName: "CarePoint Pharmacy",
      },
      {
        name: "Aditya Choudhary",
        email: "aditya@example.com",
        phone: "9990000025",
        pharmacyName: "MediPlus Store",
      },
      {
        name: "Sakshi Tandon",
        email: "sakshi@example.com",
        phone: "9990000026",
        pharmacyName: "LifeLine Pharmacy",
      },
      {
        name: "Varun Khanna",
        email: "varun@example.com",
        phone: "9990000027",
        pharmacyName: "HealthCorner",
      },
      {
        name: "Tanvi Agarwal",
        email: "tanvi@example.com",
        phone: "9990000028",
        pharmacyName: "PharmaCare",
      },
      {
        name: "Manish Sinha",
        email: "manish@example.com",
        phone: "9990000029",
        pharmacyName: "MedicoMart",
      },
      {
        name: "Ritika Sharma",
        email: "ritika@example.com",
        phone: "9990000030",
        pharmacyName: "Trust Medicos",
      },
      {
        name: "Nikhil Jain",
        email: "nikhil@example.com",
        phone: "9990000031",
        pharmacyName: "City Health Pharmacy",
      },
      {
        name: "Pallavi Desai",
        email: "pallavi@example.com",
        phone: "9990000032",
        pharmacyName: "Wellness Plus",
      },
      {
        name: "Harsh Vyas",
        email: "harsh@example.com",
        phone: "9990000033",
        pharmacyName: "CareMed Pharmacy",
      },
      {
        name: "Megha Rao",
        email: "megha@example.com",
        phone: "9990000034",
        pharmacyName: "HealthPoint",
      },
      {
        name: "Rohini Nair",
        email: "rohini@example.com",
        phone: "9990000035",
        pharmacyName: "Family Pharmacy",
      },
      {
        name: "Siddharth Malhotra",
        email: "siddharth@example.com",
        phone: "9990000036",
        pharmacyName: "GoodHealth Medicos",
      },
      {
        name: "Divya Patel",
        email: "divya@example.com",
        phone: "9990000037",
        pharmacyName: "LifeCare Plus",
      },
      {
        name: "Akshay Bhatt",
        email: "akshay@example.com",
        phone: "9990000038",
        pharmacyName: "MediWorld",
      },
      {
        name: "Simran Kaur",
        email: "simran@example.com",
        phone: "9990000039",
        pharmacyName: "PharmaTrust",
      },
      {
        name: "Vivek Reddy",
        email: "vivek@example.com",
        phone: "9990000040",
        pharmacyName: "HealthMed Store",
      },
    ];

    const users = await User.insertMany(
      sampleUsers.map((u, i) => ({
        ...u,
        password: "password123",
        passwordConfirm: "password123",
        location: {
          type: "Point",
          coordinates: [
            randomNearbyCoordinate(RAIPUR_LNG),
            randomNearbyCoordinate(RAIPUR_LAT),
          ],
        },
        medicines: generateMedicines(),
      }))
    );

    console.log("✅ Users with pharmacies created:", users.length);
  } catch (err) {
    console.error("❌ Error seeding users:", err);
  }
}
