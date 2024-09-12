const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const Squad = require("../models/Squad");
const User = require("../models/User");

router.post("/squad", async ({ body }, res) => {
  try {
    const isSquadExist = await Squad.findOne({ squad: body.squad });
    if (isSquadExist) {
      res.status(409).json({ message: "Ce nom de groupe est dèjà pris" });
    } else {
      if (body.name) {
        if (body.password) {
          const squadBody = { squad: body.squad };
          const newSquad = new Squad(squadBody);
          await newSquad.save();

          body.squad = newSquad._id;
          body.role = "admins";
          const salt = uid2(16);
          console.log("salt=>", salt);
          const hash = SHA256(body.password + salt).toString(encBase64);
          console.log("hash=>", hash);
          const token = uid2(64);
          body.password = hash;
          body.token = token;
          body.salt = salt;
          const newUser = new User(body);
          await newUser.save();
          res.status(200).json({
            name: newUser.name,
            role: newUser.role,
            token: newUser.token,
            squad: newUser.squad,
          });
        } else {
          res.status(400).json({ error: "le mot de passe est obligatoire" });
        }
      } else {
        res.status(400).json({ error: `Nom d'utilisateur oublier` });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.messages });
  }
});
module.exports = router;
