const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/updateMedicines", userController.updateMedicines);

router.get("/medicines", userController.getMedicines);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route("/:id").post(userController.updateUserLocation);
module.exports = router;
