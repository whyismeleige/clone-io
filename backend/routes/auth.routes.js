const express = require("express");
const controller = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);

router.get("/google", controller.googleAuth);
router.get("/google/callback", controller.googleCallback);

router.get("/github", controller.githubAuth);
router.get("/github/callback", controller.githubCallback);

router.post("/exchange-code", controller.exchangeCode);
module.exports = router;