const router = require("express").Router();
const controller = require("../controllers/chat.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional: Limit to 5MB
});

router.get("/public", controller.getPublicProjects);
router.patch("/public/:projectId/view", controller.incrementViewCount);
router.get("/history", controller.fetchChat);
router.post(
  "/upload-snapshot",
  upload.single("snapshot"),
  controller.uploadPreviewSnapshot
);

router.use(authenticateToken);

router.get("/list", controller.getChats);
router.post("/prompt", controller.sendPrompt);
router.post("/template", controller.createTemplate);
router.post("/upload-project-files", controller.uploadProjectToS3);
router.patch("/modify", controller.modifyChat);
router.delete("/delete", controller.deleteChat);

module.exports = router;
