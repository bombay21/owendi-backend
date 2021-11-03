const mongoose = require("mongoose");

const { MONGO_CONN } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGO_CONN)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
