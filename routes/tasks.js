const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");

router.post("/task/create", fileUpload(), async (req, res) => {
  console.log("body create ===>", req.body);
  try {
    const isTaskExist = await Task.findOne({ name: req.body.name });
    if (isTaskExist) {
      res.status(409).json({ message: "Ce nom est déja pris" });
    } else {
      const body = req.body;

      if (body.name && body.frequency) {
        body.frequency = JSON.parse(req.body.frequency);
        const newTask = new Task(body);
        await newTask.save();
        res.status(200).json(newTask);
      } else {
        res.status(400).json({ error: `Nom de tâche ou fréquence oublier` });
      }
    }
  } catch (error) {
    console.log("catchhhhhhhhhhhh");
    res.status(400).json({ message: error.message });
  }
});

router.get("/tasks/:squad", async (req, res) => {
  try {
    const squadId = req.params.squad;
    const tasks = await Task.find({ squad: squadId, isActive: true });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.messages });
  }
});

router.post("/task/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, { isActive: false });
    res.status(200).json({ message: "la tâche à été supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/task/:id", async (req, res) => {
  try {
    console.log("update!!");
    const id = req.params.id;
    const task = await Task.findById(id);
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.messages });
  }
});

router.post("/task/edit/:id", fileUpload(), async (req, res) => {
  try {
    console.log("editTask=>", req.body);
    const id = req.params.id;
    const body = req.body;

    if (id && body) {
      body.frequency = JSON.parse(req.body.frequency);
      const taskUpdate = await Task.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true }
      );
      res.status(200).json(taskUpdate);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/task/test", async (req, res) => {
  try {
    const squad = "6557b0ba5bcd52c78804669a";
    const usersTab = await User.find({ squad, isActive: true });
    const tasksTab = await Task.find({ squad, isActive: true });
    const response = assignTasksToUsers(usersTab, tasksTab);
    // console.log("resonse===>><!", response);
    res.status(200).json({ result: response });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

const assignTasks = async (squad) => {
  try {
    // Récupérer tous les utilisateurs actifs du groupe
    const users = await User.find({ isActive: true, squad }).exec();

    // Récupérer toutes les tâches actives du groupe
    const tasks = await Task.find({ isActive: true, squad }).exec();

    // Réinitialiser les tâches hebdomadaires de tous les utilisateurs
    users.forEach((user) => {
      user.weeklyTasks = {
        monday: { reference: [], number: 0 },
        tuesday: { reference: [], number: 0 },
        wednesday: { reference: [], number: 0 },
        thursday: { reference: [], number: 0 },
        friday: { reference: [], number: 0 },
        saturday: { reference: [], number: 0 },
        sunday: { reference: [], number: 0 },
      };
      user.weeklyPotentialPoints = 0; // Réinitialiser les points
    });

    // Fonction pour assigner les tâches selon les jours de la semaine
    const assignTaskToDay = (task, day, user) => {
      user.weeklyTasks[day].reference.push(task._id);
      user.weeklyTasks[day].number += 1;
      user.weeklyPotentialPoints += task.value;
      task.lastAssignedUser = user._id; // Mettre à jour le dernier utilisateur assigné
    };

    // Parcourir les jours de la semaine
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    daysOfWeek.forEach((day) => {
      tasks.forEach((task) => {
        // Vérifier si la tâche doit être effectuée ce jour
        if (task.frequency.includes(day)) {
          // Trouver l'index du dernier utilisateur à qui la tâche a été assignée
          let lastUserIndex = users.findIndex((user) =>
            user._id.equals(task.lastAssignedUser)
          );

          // Choisir le prochain utilisateur en fonction de la rotation
          let nextUser = users[(lastUserIndex + 1) % users.length];

          // Assigner la tâche à cet utilisateur pour le jour en question
          assignTaskToDay(task, day, nextUser);

          // Incrémenter l'index de rotation pour cette tâche
        }
      });
    });

    // Sauvegarder les utilisateurs et les tâches mises à jour dans la base de données
    await Promise.all([
      ...users.map((user) => user.save()),
      ...tasks.map((task) => task.save()),
    ]);

    console.log("Tâches réparties avec succès.");

    // Retourner le tableau des utilisateurs avec leurs tâches réparties
    return users;
  } catch (err) {
    console.error("Erreur lors de la répartition des tâches :", err);
    throw err; // Propager l'erreur pour qu'elle puisse être gérée en dehors de la fonction
  }
};

router.post("/tasks/distribution", async (req, res) => {
  try {
    const squad = req.body.squad;
    console.log("body===>", squad);
    const response = await assignTasks(squad);
    res.status(200).json({ result: response });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
