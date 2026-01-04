const express = require("express");
const cors = require("cors");
const connectDB = require("./database/mongoDB");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config(); // Load environment variables from .env file

const app = express();

const PORT = process.env.PORT || 8080;

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

app.use(
  cors({
    origin: ["https://josh-net.vercel.app/", "http://localhost:3001", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "JOSH Net API is running",
    timestamp: new Date().toISOString(),
  });
});


app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    type: "error",
    data: null,
  });
});

app.use(errorHandler);

app.listen(PORT, () => console.log("Server running on PORT:", PORT));