const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorize,
} = require("../middleware/auth");
const Order = require("../models/Order");

const router = require("express").Router();

// Create Order
router.post("/create", async (req, res) => {
  const payload = new Order(req.body);
  try {
    const saveOrder = await payload.save();
    res.status(201).json(saveOrder);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// Update Order
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    req.body["userId"] = req.user.userId;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Delete Order
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("order has been deleted!");
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get user Order
router.get("/find/:userId", verifyTokenAndAuthorize, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
      res.status(200).json(orders);
    
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get All orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    let orders;

    const qNew = req.query.new;
    const qLim = req.query.limit ? parseInt(req.query.limit) : 0;

    if (qNew) {
      orders = await Order.find().sort({ createdAt: -1 }).limit(qLim);
    } else {
      orders = await Order.find();
    }
      res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get monthly income
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  try {
      const productId = req.query.pid
      const queryStringDate = req.query.date;
      const date = new Date(queryStringDate);

    const filter = {
      createdAt: { $gte: date },
      ...(productId && { products: { $elemMatch: { productId } } }),
    };
    const income = await Order.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount"
        },
      },
      {
        $group: { _id: "$month", income: {$sum: "$sales"} },
      },
    ]);
    res.status(200).send(income);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

module.exports = router;
