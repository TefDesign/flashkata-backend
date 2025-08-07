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


const challengeModel = {
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
};

router.get('/getUser/:id/:token', async(req, res) => {
  try {
  const user = await User.findById({_id : req.params.id})

  res.json(req.params.token === user.token ? {result : true, user : user} : {result : false, error : 'invalid token'})
  } catch (error) {
    res.json({error : error})
  }
})

router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  try {
    console.log("debut route");

    const data = await User.findOne({ email: req.body.email });
    if (data === null) {

      let newUser = await new User({
        userName: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        token: uid2(32),
        avatar: req.body.avatar ? req.body.avatar : '',
        firstName: req.body.firstName ? req.body.firstName : '',
        lastName: req.body.lastName ? req.body.lastName : '',
        email: req.body.email,
        hasTuto: false,
        hiraganaChallenge: challengeModel,
        katakanaChallenge: challengeModel,
        AllChallenge: challengeModel,
      });
      console.log("user crée");


      let kataProgress = [];
      const kata = await Katakana.find({});
    
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
          priority: 1,
        }).save();
        kataProgress = [...kataProgress, newKata._id];
      }
      console.log("kata crée");


      let hiraProgress = [];      
      const hira = await Hiragana.find({});

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
          priority: 1,
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
        username: newUser.userName,
        id: newUser._id,
        isConnected: true,
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  } catch (error) {
    console.log("error", error);
    res.json({ error: error });
  }
});

router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  const user = await User.findOne({ email: req.body.email });

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({
      result: true,
      token: user.token,
      username: user.userName,
      id: user._id,
      isConnected: true,
    });
  } else {
    res.json(
      user
        ? { result: false, error: "wrong password" }
        : { result: false, error: "user not found" }
    );
  }
});

// route de modification de l'utilisateur
router.patch("/modify", async (req, res) => {
  if (!checkBody(req.body, ["token", "id"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  const user = await User.findById({ _id: req.body.id });
  try {
    // verification du token
    if (req.body.token !== user.token) {
      res.json({ result: false, error: "invalid token" });
      return;
    }
    req.body.userName ? (user.userName = req.body.username) : null;
    req.body.password
      ? (user.password = bcrypt.hashSync(req.body.password, 10))
      : null;
    req.body.avatar ? (user.avatar = req.body.avatar) : null;
    req.body.firstName ? (user.firstName = req.body.firstName) : null;
    req.body.lastName ? (user.lastName = req.body.lastName) : null;
    req.body.email ? (user.email = req.body.email) : null;
    req.body.hasTuto ? (user.hasTuto = req.body.hasTuto) : null;

    user.save();
    res.json({ result: true, user: user });
  } catch (error) {
    res.json({ result: false, error: error });
  }
});



module.exports = router;
