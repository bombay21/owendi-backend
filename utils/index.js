const validateUserInput = (req, isRegister) => {
  let message = "";

  if (!req.body.username && isRegister) message = "username is required";
  else if (!req.body.email) message = "email is required";
  else if (!req.body.password) message = "password is required";

  let isValid = !message ? true : false;

  return { isValid, message };
};

module.exports = { validateUserInput };
