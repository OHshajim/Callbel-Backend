const User = require("../../../models/User");

const verifyCode = async (req, res) => {
  let { email, code } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", email: "email required" });
  }

  let user;

  try {
    user = await User.findOne({ email });
  } catch (e) {
    return res
      .status(404)
      .json({ status: "error", email: "error while reading database" });
  }

  if (!user) {
    return res
      .status(404)
      .json({ status: "error", email: "no user matches this email address" });
  }

  if (user.otp !== parseFloat(code)) {
    return res.status(400).json({ status: "error", message: "invalid code" });
  }

  res.status(200).json({ success: true, message: "otp matched" });
};

module.exports = verifyCode;
