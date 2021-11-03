const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorize,
} = require("../middleware/auth");
const Cart = require("../models/Cart");

const router = require("express").Router();

// Add Item to Cart
router.post("/add", async (req, res) => {
  const payload = new Cart(req.body);
  try {
    const saveCart = await payload.save();
    res.status(201).json(saveCart);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// Update Cart
router.put("/:id",verifyTokenAndAuthorize, async (req, res) => {
  try {
    req.body["userId"] = req.user.userId;
    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Delete Cart
router.delete("/:id", verifyTokenAndAuthorize, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("cart has been deleted!");
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get user Cart
router.get("/find/:userId", verifyTokenAndAuthorize, async (req, res) => {
  try {
    const cart = await Cart.findOne({userId: req.params.userId});
      res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get All Carts
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    let carts;

    const qNew = req.query.new;
    const qLim = req.query.limit ? parseInt(req.query.limit) : 0;

    if (qNew) {
      carts = await Cart.find().sort({ createdAt: -1 }).limit(qLim);
    } else {
      carts = await Cart.find();
    }
      res.status(200).json(carts);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

module.exports = router;
