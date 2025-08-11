const express = require("express");
const router = express.Router();
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const uid2 = require("uid2");


const kataNames = [
  'a', 'i', 'u', 'e', 'o',
  'ka', 'ki', 'ku', 'ke', 'ko',
  'sa', 'shi', 'su', 'se', 'so',
  'ta', 'chi', 'tsu', 'te', 'to',
  'na', 'ni', 'nu', 'ne', 'no',
  'ha', 'hi', 'fu', 'he', 'ho',
  'ma', 'mi', 'mu', 'me', 'mo',
  'ya', 'yu', 'yo',
  'ra', 'ri', 'ru', 're', 'ro',
  'wa', 'wo', 'n'
];



// créer la liste des kata en bd, commande en dev pas en prod
router.post("/kataGen", async (req, res) => {
  try {
    for (let i = 0; i < kataNames.length; i++) {
      const kata = await new Katakana({
        name: kataNames[i],
      }).save();
      const hira = await new Hiragana({
        name: kataNames[i],
  
      }).save();
    }
    res.json({ result: true });
    
  } catch (error) {
    res.json({error : error, message: "erreur d'enregistrement des katas"})
  }
});


router.get("/katakana", async (req, res) => {
  const resp = await Katakana.find({});
  res.json(resp);
});

router.get("/hiragana", async (req, res) => {
  const resp = await Hiragana.find({});
  res.json(resp);
});

module.exports = router;
