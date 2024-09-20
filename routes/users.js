const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const User = require("../models/User");
const Squad = require("../models/Squad");

router.post("/user/create", fileUpload(), async ({ body }, res) => {
  console.log(body);
  try {
    const isUserExist = await User.findOne({
      name: body.name,
      squad: body.squad,
    });
    if (isUserExist) {
      res.status(409).json({ message: "Ce nom est déja pris" });
    } else {
      if (body.name) {
        if (body.password) {
          const salt = uid2(16);
          const hash = SHA256(body.password + salt).toString(encBase64);
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
    res.status(400).json({ message: error.message });
  }
});

router.get("/users/:squad", async (req, res) => {
  try {
    const squadId = req.params.squad;
    const users = await User.find({ squad: squadId, isActive: true });
    console.log("users=>", users.length);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.messages });
  }
});

router.post("/login", async ({ body }, res) => {
  try {
    if (body.name && body.squad) {
      const squad = await Squad.findOne({ squad: body.squad });

      const user = await User.findOne({ squad: squad._id, name: body.name });
      if (user) {
        // const newHash = SHA256(body.password + user.salt).toString(encBase64);
        // console.log("password=>", user.password);

        const newHash = "z23pxMNwG3Wp3a3q4p2drwfnirtPT2obXaLbubNwLtE=";
        console.log("ici=>", newHash);
        if (newHash === user.password) {
          res.status(200).json({
            name: user.name,
            role: user.role,
            token: user.token,
            squad: user.squad,
          });
        } else {
          res.status(401).json({ message: "Vous n'êtes pas autorisé" });
        }
      } else {
        console.log("no user");
        res.status(400).json({ message: "Utilisateur inconnu" });
      }
    } else {
      res
        .status(400)
        .json({ error: "Vous avez oubliez un champ du formulaire" });
    }
  } catch (error) {
    console.log("catch login");
    res.status(400).json({ message: error.messages });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    console.log("update!!222");
    const id = req.params.id;
    const user = await User.findById(id).select("-password -salt");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.messages });
  }
});

router.post("/user/edit/:id", fileUpload(), async (req, res) => {
  try {
    console.log("UserEdit=>", req.body);
    const id = req.params.id;
    const body = req.body;
    if (id && body) {
      if (body.password) {
        const userToEdit = await User.findById(id);
        const newHash = SHA256(body.currentPassword + userToEdit.salt).toString(
          encBase64
        );
        if (newHash === userToEdit.password) {
          const userUpdate = await User.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
          );
          res.status(200).json({
            name: userUpdate.name,
            role: userUpdate.role,
            token: userUpdate.token,
            squad: userUpdate.squad,
            avatar: userUpdate.avatar,
          });
        } else {
          res.status(400).json({ error: "Vous n'êtes pas autorisé" });
        }
      } else {
        const userUpdate = await User.findByIdAndUpdate(
          id,
          { $set: body },
          { new: true }
        );
        res.status(200).json({
          name: userUpdate.name,
          role: userUpdate.role,
          token: userUpdate.token,
          squad: userUpdate.squad,
          avatar: userUpdate.avatar,
        });
      }
    } else {
      res.status(400).json({ error: "L'utilisateur est inconnu" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { isActive: false });
    res.status(200).json({ message: "l'utilisateur à été supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
