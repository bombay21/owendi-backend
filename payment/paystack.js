const paystack = (axios) => {
  const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRET}`;
  const initializePayment = (form, mycallback) => {
    const url = "https://api.paystack.co/transaction/initialize";
    const headers = {
      authorization: MySecretKey,
      "content-type": "application/json",
      "cache-control": "no-cache"
    };
    axios
      .post(url, form, { headers })
      .then((error, body) => {
        console.log(`body ::: ${body}`);
        return mycallback(error, body);
      })
      .catch((err) => {
        console.log(`err: error`);
        return err;
      });
  };

  const verifyPayment = (ref, mycallback) => {
    const options = {
      url:
        "https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref),
      headers: {
        authorization: MySecretKey,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    };
    const callback = (error, response, body) => {
      return mycallback(error, body);
    };
    request(options, callback);
  };
  return { initializePayment, verifyPayment };
};

module.exports = paystack;
