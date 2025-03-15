const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/updateMedicines", userController.updateMedicines);

router.get("/medicines", protect, userController.getMedicines);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/updateMe", protect, userController.updateMe);
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route("/:id").get(userController.getUserById);

module.exports = router;
