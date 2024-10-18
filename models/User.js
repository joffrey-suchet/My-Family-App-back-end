const mongoose = require("mongoose");

const roles = ["user", "admins"];

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
  weeklyTasks: [
    {
      day: String,
      tasks: [
        {
          task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
          completed: { type: Boolean, default: false },
          validated: { type: Boolean, default: false },
        },
      ],
      number: { type: Number, default: 0 },
    },
  ],
  weeklyPotentialPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});
module.exports = User;
