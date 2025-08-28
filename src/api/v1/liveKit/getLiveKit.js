const { AccessToken } = require("livekit-server-sdk");
const LiveKit = require("../../../models/LliveKit");

const getLiveKit = async (req, res, next) => {
  try {
    const { key, secret } = await LiveKit.findOne();

    if (!key || !secret) {
      return res.status(500).json({ error: "LiveKit credentials not found" });
    }

    const { roomName, username } = req.query;

    // Create token
    const at = new AccessToken(key, secret, { identity: username });

    // Add permissions
    at.addGrant({ roomJoin: true, room: roomName });

    // Wait for the token string
    const token = await at.toJwt();

    res.json({ token });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = getLiveKit;
