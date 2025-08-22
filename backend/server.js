const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const patientRoutes = require("./routes/patients");
const doctorRoutes = require("./routes/doctors");
const appointmentRoutes = require("./routes/appointments");
const consultationRoutes = require("./routes/consultations");
const prescriptionRoutes = require("./routes/prescriptions");
const medicalRecordRoutes = require("./routes/medicalRecords");
const billingRoutes = require("./routes/billing");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");
const secretaryRoutes = require("./routes/secretaries");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { notFound } = require("./middleware/notFound");

// Import socket handlers
const { initializeSocket } = require("./socket/socketHandlers");

// Import database connection
const connectDB = require("./config/database");

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket handlers
initializeSocket(io);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "DOKTOR API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/patients`, patientRoutes);
app.use(`/api/${apiVersion}/doctors`, doctorRoutes);
app.use(`/api/${apiVersion}/appointments`, appointmentRoutes);
app.use(`/api/${apiVersion}/consultations`, consultationRoutes);
app.use(`/api/${apiVersion}/prescriptions`, prescriptionRoutes);
app.use(`/api/${apiVersion}/medical-records`, medicalRecordRoutes);
app.use(`/api/${apiVersion}/billing`, billingRoutes);
app.use(`/api/${apiVersion}/chat`, chatRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/secretaries`, secretaryRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 DOKTOR Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${apiVersion}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

module.exports = { app, server, io };
