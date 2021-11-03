require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");

app.use(cors())
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const categoryRoute = require("./routes/category");
const paymentRoute = require("./routes/payment");

// Logic goes here
app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/category", categoryRoute);
app.use("/api/checkout", paymentRoute);

module.exports = app;