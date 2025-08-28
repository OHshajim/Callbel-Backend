const randomstring = require("randomstring");
const User = require("../../../models/User");
const sendBrevoCampaign = require("../../../utils/brevoEmail");

const sendOtp = async (req, res) => {
  let { email } = req.body;

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

  const code = randomstring.generate({ charset: "numeric", length: 6 });

  await sendBrevoCampaign({
    subject: `${process.env.WEBSITE_NAME} - Password Reset Code`,
    senderName: process.env.WEBSITE_NAME,
    senderEmail: process.env.BREVO_EMAIL,
    htmlContent: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Hi ${user.name},</h2>
      <p style="font-size: 16px; color: #555;">We received a request to reset your password. Please use the authentication code below to proceed:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #2e7dff; border: 2px dashed #2e7dff; padding: 12px 20px; display: inline-block; border-radius: 8px;">
          ${code}
        </span>
      </div>

      <p style="font-size: 14px; color: #777;">This code is valid for the next 10 minutes. If you didn’t request this, please ignore this email or contact support.</p>

      <p style="font-size: 14px; color: #999; margin-top: 40px;">Thanks,<br/>The ${
        process.env.WEBSITE_NAME
      } Team</p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        © ${new Date().getFullYear()} ${
      process.env.WEBSITE_NAME
    }.in — All rights reserved.
      </p>
    </div>
  </div>
  `,
    to: email,
  });

  await User.findOneAndUpdate({ email }, { $set: { otp: code } });
  res.status(200).json({ success: true, message: "email queued" });
};

module.exports = sendOtp;
