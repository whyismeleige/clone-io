const express = require("express");
const controller = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);

router.get("/google", controller.googleAuth);
router.get("/google/callback", controller.googleCallback);

router.get("/github", controller.githubAuth);
router.get("/github/callback", controller.githubCallback);

router.post("/exchange", controller.exchangeCode);

router.post("/logout", authenticateToken, controller.logout);

module.exports = router;
