const mongoose = require("mongoose");

const roles = ["user", "admins"];

const taskOfDayModel = {
  reference: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  number: { type: Number, default: 0 },
};
const User = mongoose.model("User", {
  name: String,
  password: { type: String, default: "0000" },
  salt: String,
  avatar: Object,
  token: String,
  squad: { type: mongoose.Schema.Types.ObjectId, ref: "Squad" },
  role: {
    type: String,
    required: true,
    default: roles[0],
    enum: roles,
  },
  totalPoints: { type: Number, default: 0 },
  weeklyTasks: {
    monday: taskOfDayModel,
    tuesday: taskOfDayModel,
    wednesday: taskOfDayModel,
    thursday: taskOfDayModel,
    friday: taskOfDayModel,
    saturday: taskOfDayModel,
    sunday: taskOfDayModel,
  },
  isActive: { type: Boolean, default: true },
});
module.exports = User;
