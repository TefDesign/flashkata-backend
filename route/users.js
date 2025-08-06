var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const katakanaProgress = require("../models/KatakanaProgress");
const hiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  try {
    console.log("debut route");

    const data = await User.findOne({ email: req.body.email });
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      let newUser = await new User({
        userName: req.body.username,
        password: hash,
        token: uid2(32),
        avatar: req.body.avater,
        firstName: req.body.user,
        lastName: req.body.lastName,
        email: req.body.email,
        hasTuto: req.body.hasTuto,
        hiraganaChallenge: {
          "1min": 0,
          "2min": 0,
          "3min": 0,
          "4min": 0,
          "5min": 0,
          "6min": 0,
          "7min": 0,
          "8min": 0,
          "9min": 0,
          "10min": 0,
        },
        katakanaChallenge: {
          "1min": 0,
          "2min": 0,
          "3min": 0,
          "4min": 0,
          "5min": 0,
          "6min": 0,
          "7min": 0,
          "8min": 0,
          "9min": 0,
          "10min": 0,
        },
        AllChallenge: {
          "1min": 0,
          "2min": 0,
          "3min": 0,
          "4min": 0,
          "5min": 0,
          "6min": 0,
          "7min": 0,
          "8min": 0,
          "9min": 0,
          "10min": 0,
        },
      });
      console.log("user crée");

      const kata = await Katakana.find({});
      let kataProgress = [];

      for (let i = 0; i < kata.length; i++) {
        const newKata = await new katakanaProgress({
          katakanaId: kata[i]._id,
          userId: newUser._id,
          isValidated: false,
          validatedAt: new Date(),
          name: kata[i].name,
          responseTime: 0,
          nbViews: 0,
          nbCorrect: 0,
          nbWrong: 0,
          isFavorite: false,
          priority : 1
        }).save();
        kataProgress = [...kataProgress, newKata._id];
      }
      console.log("kata crée");

      const hira = await Hiragana.find({});
      let hiraProgress = [];

      for (let i = 0; i < hira.length; i++) {
        const newHira = await new hiraganaProgress({
          hiraganaId: hira[i]._id,
          userId: newUser._id,
          isValidated: false,
          validatedAt: new Date(),
          name: hira[i].name,
          responseTime: 0,
          nbViews: 0,
          nbCorrect: 0,
          nbWrong: 0,
          isFavorite: false,
          priority: 1
        }).save();
        hiraProgress = [...hiraProgress, newHira._id];
      }
      console.log("hira crée");

      newUser.hiraganaProgress = hiraProgress;
      console.log("hira save");
      newUser.katakanaProgress = kataProgress;
      console.log("kata save");
      newUser.save();
      console.log("user save");

      res.json({
        result: true,
        token: newUser.token,
        userName: newUser.userName,
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  } catch (error) {
    console.log("Coucou c'est làa", error);
  }
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // User.findOne({ username: req.body.username })
  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        username: data.username,
        isConnected: true,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

module.exports = router;
