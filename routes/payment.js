const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorize,
} = require("../middleware/auth");
const router = require("express").Router();
const axios = require("axios");
const Donor = require("../models/PaymentDonor");

router.get("/verify",verifyTokenAndAuthorize, async (req, res) => {
  const ref = req.query.trxref;
  await axios
    .get(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: {
        authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    })
    .then(async (result) => {
      const {
        reference,
        amount,
        customer: { email },
      } = result.data.data;

      const newDonor = { reference, amount, email };
      newDonor["amount"] /= 100 
      newDonor["full_name"] = email 
      
      const donor = new Donor(newDonor);
      await donor
        .save()
        .then((donor) => {
          if (!donor) {
            // Redirect to error page
            return res.status(400).json({
              success: false,
              message: "An error occurred while saving payment details",
              result: "error",
            });
          }
          res.redirect(
            `http://localhost:5000/api/checkout/receipt/${donor._id}`
          );
        })
        .catch((error) => {
          return res.status(400).json({
            success: false,
            message: "Payment details could not be saved",
            result: error.message,
          });
        });
    })
    .catch((error) => {
      return res.status(400).json({
        success: false,
        message: "An error occured while verifying payment",
        result: error.message,
      });
    });
});

router.get("/receipt/:id", async (req, res) => {
  const id = req.params.id;
  await Donor.findById(id)
    .then((donor) => {
      if (!donor) {
        //handle error when the donor is not found
        return res.status(400).json({
          success: false,
          message: "Donor not found",
          result: "error",
        });
      }
      //   res.render("success.pug", { donor });
      return res
        .status(200)
        .json(
          `${donor.full_name}, your payment of ${
            donor.amount
          } was successful`
        );
    })
    .catch((error) => {
      return res.status(400).json({
        success: false,
        message: "An error occurred while generating receipt",
        result: error.message,
      });
    });
});

module.exports = router;
