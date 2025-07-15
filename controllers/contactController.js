const Contact = require("../models/contactModel");

// 📨 Submit contact form
exports.submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required." });
  }
  const contact = await Contact.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, message: "Message received!", data: contact });
};

// 👁️ List all contacts (admin only)
exports.getAllContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json({ success: true, data: contacts });
};
