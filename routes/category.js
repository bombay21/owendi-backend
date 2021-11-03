const { verifyTokenAndAdmin } = require("../middleware/auth");
const Category = require("../models/Category");

const router = require("express").Router();

// Add Category
router.post("/add", verifyTokenAndAdmin, async (req, res) => {
  try {
    const payload = new Category(req.body);
    const category = await Category.save(payload);
    res.status(200).json(category)
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Update Category
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Delete Category
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json("category has been deleted!");
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get All Categories
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const categories = await Category.find();
    if (categories) {
      res.status(200).json(categories);
    } else {
      res.status(400).json({ error: "no category exists!" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

module.exports = router;
