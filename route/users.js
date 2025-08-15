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
const { createProgress } = require("../modules/createProgress");

// models pour les objets challenge
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



// recupère les information d'un utilisateur avec les params
router.get("/getUser/:id/:token", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });

    
    // verification du token avant la réponse
    res.json(
      req.params.token === user.token
        ? { result: true, user: user }
        : { result: false, error: "invalid token" }
    );
  } catch (error) {
    res.json({ error: error });
  }
});

// route pour l'inscription
router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["userName", "password", "email"])) {
    res.json({ result: false, message: "Champs manquants ou vides.", error: "Missing or empty fields" });
    return;
  }
  try {    
    console.log('debut de route')
    const data = await User.findOne({ email: req.body.email });
    if (data === null) {
      // creation d'un utilisateur
      let newUser = await new User({
        userName: req.body.userName,
        password: bcrypt.hashSync(req.body.password, 10),
        token: uid2(32),
        avatar: req.body.avatar ? req.body.avatar : "",
        firstName: req.body.firstName ? req.body.firstName : "",
        lastName: req.body.lastName ? req.body.lastName : "",
        email: req.body.email,
        hasTuto: false,
        hiraganaChallenge: challengeModel,
        katakanaChallenge: challengeModel,
        AllChallenge: challengeModel,
      });

      console.log('user creation ok')
      // on cherche la liste des katakana et on boucle pour créer une liste de katakana progress
      const katakanaList = await Katakana.find({});
      const kataProgress = await createProgress({
        list: katakanaList,
        userId: newUser._id,
        ProgressModel: katakanaProgress,
        idField: "katakanaId",
      });

      // on cherche la liste des hiragana et on boucle pour créer une liste de hiragana progress
      const hiraganaListe = await Hiragana.find({});
      const hiraProgress = await createProgress({
        list: hiraganaListe,
        userId: newUser._id,
        ProgressModel: hiraganaProgress,
        idField: "hiraganaId",
      });
      console.log('creation progress ok')

      // on ajoute les listes de progress dans l'utilisateur
      newUser.hiraganaProgress = hiraProgress;
      newUser.katakanaProgress = kataProgress;

      // on sauvegarde l'utilisateur
      await newUser.save();
      console.log('sauvegarde user en bd')

      res.json({
        result: true,
        token: newUser.token,
        userName: newUser.userName,
        id: newUser._id,
        isConnected: true,
        user: newUser,
      });
    } else {
      res.json({ result: false, message: "L'utilisateur existe déjà." ,error: "User already exists" });
    }
  } catch (error) {
    console.log("error", error);
    res.json({ result : false , error: error });
  }
});

// route pour la connexion
router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["password", "email"])) {
    res.json({ result: false, message: "Champs manquants ou vides.", error: "Missing or empty fields" });
    return;
  }

   const { email, password } = req.body

  const user = await User.findOne({ email: email });


  // verification de l'utilisateur et du mot de passe
  if (user && bcrypt.compareSync(password, user.password)) {
    res.json({
      result: true,
      token: user.token,
      userName: user.userName,
      id: user._id,
      isConnected: true,
    });
  } else {
    res.json(
      user
        ? { result: false,message: "Utilisateur ou mot de passe incorrect.", error: "wrong password" }
        : { result: false,message: "Utilisateur ou mot de passe incorrect.", error: "user not found" }
    );
  }
});

// route de modification de l'utilisateur
router.patch("/modify", async (req, res) => {
  if (!checkBody(req.body, ["token", "id"])) {
    res.json({ result: false, message: "Champs manquants ou vides" , error: "Missing or empty fields" });
    return;
  }

 

  const user = await User.findById({ _id: req.body.id });
  try {
    // verification du token
    if (req.body.token !== user.token) {
      res.json({ result: false, messgae: "token invalid", error: "invalid token" });
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

    await user.save();
    
    res.json({ result: true, user: user });
  } catch (error) {
    res.json({ result: false, error: error });
  }
});

router.patch("/challengeScore", async (req, res) => {

  if (!checkBody(req.body, ["token", "id"])) {
    res.json({ result: false, message: "Champs manquants ou vides" , error: "Missing or empty fields" });
    return;
  }
  const user = await User.findById({ _id: req.body.id });
  try {
    // verification du token
    if (req.body.token !== user.token) {
      res.json({ result: false, messgae: "token invalid", error: "invalid token" });
      return;
    }

    const { score, time } = req.body

    // ATTENTION req.body de Allchallenge = "all" donc il faut -> "All" car AllChallenge et pas allChallenge dans models
    let { challengeType }  = req.body
      
      let isNewRecord = false;

      if (challengeType === "hiragana" || challengeType === "katakana")
      {
        const previous = user[`${challengeType}Challenge`][time] || 0;
        if (previous < score){
          user[`${challengeType}Challenge`][time] = score
          await user.save();
          isNewRecord = true
          console.log("isnewrecordhirakata", isNewRecord)
        }
      } 
      

      if (challengeType === "all"){
        const previous = user[`${challengeType}Challenge`][time] || 0;
        if (previous < score){
          user[`${challengeType}Challenge`][time] = score
          await user.save();
          isNewRecord = true
          console.log("isnewrecordAll", isNewRecord)
        }
      }
      
    console.log("isnewrecord", isNewRecord)
    
    res.json({ result: true, isNewRecord, user: user[`${challengeType}Challenge`] });
  } catch (error) {
    res.json({ result: false, error: error });
  }

})


module.exports = router;
