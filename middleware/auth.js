const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res
      .status(403)
      .send({ error: "A token is required for authentication" });
  } else {
    try {
      const decoded = jwt.verify(token, config.JWT_KEY);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).send({ error: "Invalid token" });
    }
  }
};

const verifyTokenAndAuthorize = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userId === req.params.id || req.user.isAdmin) {
      return next();
    } else {
      return res.status(400).json({ error: "request not permitted" });
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      return next();
    } else {
      return res.status(400).json({ error: "request not permitted" });
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuthorize, verifyTokenAndAdmin };
