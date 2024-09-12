const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/familyApp");

app.use(cors());

app.use(express.json());

const users = require("./routes/users");
app.use(users);

const squads = require("./routes/squads");
app.use(squads);

const tasks = require("./routes/tasks");
app.use(tasks);

app.all("*", function (req, res) {
  console.log("all");
  res.status(404).json({ message: "Page not found" });
});

app.listen(3006, () => {
  console.log("server has started");
});
