const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const helper = require("../utils");
var jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // ensure request is valid
    if (!(email && password && username)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const user_exists = await User.findOne({ email });

    if (user_exists) {
      return res.status(409).send({error: "User Already Exists. Please Login"});
    }

    // Encrypt user password
    const enc_password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.ENCRYPTION_KEY
    );

    const payload = new User({
      username: req.body.username,
      email: req.body.email,
      password: enc_password,
    });

    await payload
      .save()
      .then(() => {
        res.status(201).json({
          message: "User saved successfully!",
        });
      })
      .catch((err) => {
        // Handle Error
        ({ message } = err);
        res.status(400).send({ error: message });
      });
  } catch (err) {
    res.status(400).send({ error: err });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log(`REQ ::> ${JSON.stringify(req.body)}`);

    // ensure request is valid
    if (!(email && password)) {
      return res
        .status(200)
        .send({
          code: 400,
          isSuccess: false,
          message: "All input fields are required!",
        });
    }

    let user = await User.findOne({ email: req.body.email });

    if (!user) return res
      .status(200)
      .json({ code: 400, isSuccess: false, message: "user not found!" });

    // Decrypt user password
    const dec_password = CryptoJS.AES.decrypt(
      user.password,
      process.env.ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
      
    if (req.body.password === dec_password) {
      const { password, ...others } = user._doc;

      let token = jwt.sign(
        {
          userId: others._id,
          isAdmin: others.isAdmin,
        },
        process.env.JWT_KEY,
        { expiresIn: "2d" }
      );

      return res.status(200).json({ code: 200, isSuccess: true, payload:{...others, token} });
    } else return res
      .status(200)
      .json({
        code: 400,
        isSuccess: false,
        message: "email or password mismatch",
      });
  } catch (err) {
    return res
      .status(200)
      .json({ code: 400, isSuccess: false, message: err.message });
  }
});

module.exports = router;
