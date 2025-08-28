const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }, // Optional: add timestamp
});

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
