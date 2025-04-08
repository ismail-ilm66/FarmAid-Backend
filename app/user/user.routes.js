const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const authenticateToken = require("../../middlewares/authenticate-token");

const userController = require("./user.controller");

router.post("/signup", upload.single("profilePic"), userController.signup);
router.post("/signin", upload.none(), userController.signin);
router.put(
  "/edit",
  authenticateToken,
  upload.single("profilePic"),
  userController.editAccount
);
router.put("/resetPassword", userController.resetPassword);

router.delete("/delete", userController.deleteAccount);
router.get("/check", userController.checkUser);

module.exports = router;
