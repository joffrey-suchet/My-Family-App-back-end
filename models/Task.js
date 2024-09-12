const mongoose = require("mongoose");

const Task = mongoose.model("Task", {
  name: String,
  squad: { type: mongoose.Schema.Types.ObjectId, ref: "Squad" },
  avatar: { type: Object },
  frequency: [String],
  lastAssignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  value: Number,
  isActive: { type: Boolean, default: true },
});
module.exports = Task;
