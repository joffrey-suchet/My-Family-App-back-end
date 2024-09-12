const mongoose = require("mongoose");

const Squad = mongoose.model("Squad", {
  squad: { type: String, unique: true },
});

module.exports = Squad;
