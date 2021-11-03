const CryptoJS = require("crypto-js");
const {
  verifyTokenAndAuthorize,
  verifyTokenAndAdmin,
} = require("../middleware/auth");
const User = require("../models/User");

const router = require("express").Router();

// Update User
router.put("/:id", verifyTokenAndAuthorize, async (req, res) => {
  if (req.body.password) {
    // Encrypt user password
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.ENCRYPTION_KEY
    ).toString();
  }
  if (req.body.isAdmin) {
    // reject request to change admin privilege
    res.status(400).json({ error: "you cannot change admin status" });
  } else {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }
});

// Admin Update User
router.put("/admin/:id", verifyTokenAndAdmin, async (req, res) => {
  if (req.body.password) {
    // Encrypt user password
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.ENCRYPTION_KEY
    ).toString();
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Delete User
router.delete("/:id", verifyTokenAndAuthorize, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json("user has been deleted!");
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get User
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const { password, ...others } = user._doc;

      res.status(200).json(others);
    } else {
      res.status(400).json({ error: "user does not exist!" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get All Users
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const query = req.query.new;
    // const lim = parseInt(req.query.limit);
    const users = query
    ? await User.find().sort({ createdAt: -1 })
    // ? await User.find().sort({ createdAt: -1 }).limit(lim)
    : await User.find();
    if (users) {
      let usersVoidPassword = [];
      users.forEach((user, key) => {
        const { password, ...details } = user._doc;
        usersVoidPassword.push(details);
      });

      res.status(200).json(usersVoidPassword);
    } else {
      res.status(400).json({ error: "users do not exist!" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get User Stats
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  try {
    const queryStringDate = req.query.date;
    const date = new Date(queryStringDate);

    const filter = { createdAt: { $gte: date } };
    const data = await User.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: { _id: "$month", count: { $sum: 1 } },
      },
    ]);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

module.exports = router;
