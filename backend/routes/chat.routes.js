const router = require("express").Router();
const controller = require("../controllers/chat.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/public", controller.getPublicProjects);
router.patch("/public/:projectId/view", controller.incrementViewCount);

router.use(authenticateToken);

router.get("/history", controller.fetchChat);
router.get("/list", controller.getChats);
router.post("/prompt", controller.sendPrompt);
router.post("/template", controller.createTemplate);
router.post("/upload-project-files", controller.uploadProjectToS3);
router.patch("/modify", controller.modifyChat);
router.delete("/delete", controller.deleteChat);

module.exports = router;
