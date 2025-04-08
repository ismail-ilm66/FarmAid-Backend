const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("../configs/db-config");

//Import all routes here
const userRoutes = require("./user/user.routes");
const otpRoutes = require("./otp/otp.routes");

require("../cronJobs/subscriptionExpiry");

const app = express();
const server = http.createServer(app); // Ensure server is created before Socket.IO

// APP SETUP
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use the routes here
app.use("/api/v2/user", userRoutes);
app.use("/api/v2/otp", otpRoutes);
// app.use("/api/v2/subscription", subscriptionRoutes);

// Sequelize Connection with DB
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

server.listen(port, () => console.log(`Server running on port ${port}`));
