const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/userWeeklyTasks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password -salt").populate({
      path: "weeklyTasks.tasks", // Chemin vers les tâches dans weeklyTasks
      model: "Task", // Modèle à utiliser pour la population
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.messages });
  }
});
module.exports = router;
