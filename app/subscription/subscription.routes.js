const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();


const subscriptionController = require("./subscription.controller");

router.post("/", upload.single("planPic"), subscriptionController.addSubscriptionPlan);
router.put("/", upload.single("planPic"), subscriptionController.editPlan);
router.get("/", subscriptionController.getAllPlans);
router.delete("/", subscriptionController.deletePlan);
router.post("/activate", subscriptionController.subscribeUser);
module.exports = router;
