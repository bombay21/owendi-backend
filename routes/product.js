const { verifyTokenAndAdmin } = require("../middleware/auth");
const Product = require("../models/Product");

const router = require("express").Router();

// Add New Product
router.post("/add", verifyTokenAndAdmin, async (req, res) => {
  req.body["addedBy"] = req.user.userId
  const payload = new Product(req.body);
  try {
    const saveProduct = await payload.save();
    res.status(201).json(saveProduct);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// Update Product
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    req.body["updatedBy"] = req.user.userId;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Delete Product
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("product has been deleted!");
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get Product
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(400).json({ error: "product does not exist!" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  try {
    let products

    const qNew = req.query.new;
    const qLim = req.query.limit
      ? parseInt(req.query.limit)
      : 0;
    const qCat = req.query.category;

    if(qNew){
      products = await Product.find().sort({ createdAt: -1 }).limit(qLim)
    } else if (qCat){
      products = await Product.find({
        categories: {
          $in: [qCat]
        }
      });
    } else{
      products = await Product.find()
    }
      res.status(200).json(products);
    
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

module.exports = router;
