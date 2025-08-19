const express = require("express");
const router = express.Router();
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const uid2 = require("uid2");


const hiraganaNames = [
  "01-hiragana-a", "02-hiragana-i", "03-hiragana-u", "04-hiragana-e", "05-hiragana-o",
  "06-hiragana-ka", "07-hiragana-ki", "08-hiragana-ku", "09-hiragana-ke", "10-hiragana-ko",
  "11-hiragana-sa", "12-hiragana-shi", "13-hiragana-su", "14-hiragana-se", "15-hiragana-so",
  "16-hiragana-ta", "17-hiragana-chi", "18-hiragana-tsu", "19-hiragana-te", "20-hiragana-to",
  "21-hiragana-na", "22-hiragana-ni", "23-hiragana-nu", "24-hiragana-ne", "25-hiragana-no",
  "26-hiragana-ha", "27-hiragana-hi", "28-hiragana-fu", "29-hiragana-he", "30-hiragana-ho",
  "31-hiragana-ma", "32-hiragana-mi", "33-hiragana-mu", "34-hiragana-me", "35-hiragana-mo",
  "36-hiragana-ya", "38-hiragana-yu", "40-hiragana-yo",
  "41-hiragana-ra", "42-hiragana-ri", "43-hiragana-ru", "44-hiragana-re", "45-hiragana-ro",
  "46-hiragana-wa", "50-hiragana-wo", "51-hiragana-n"
];

const katakanaNames = [
  "01-katakana-a", "02-katakana-i", "03-katakana-u", "04-katakana-e", "05-katakana-o",
  "06-katakana-ka", "07-katakana-ki", "08-katakana-ku", "09-katakana-ke", "10-katakana-ko",
  "11-katakana-sa", "12-katakana-shi", "13-katakana-su", "14-katakana-se", "15-katakana-so",
  "16-katakana-ta", "17-katakana-chi", "18-katakana-tsu", "19-katakana-te", "20-katakana-to",
  "21-katakana-na", "22-katakana-ni", "23-katakana-nu", "24-katakana-ne", "25-katakana-no",
  "26-katakana-ha", "27-katakana-hi", "28-katakana-fu", "29-katakana-he", "30-katakana-ho",
  "31-katakana-ma", "32-katakana-mi", "33-katakana-mu", "34-katakana-me", "35-katakana-mo",
  "36-katakana-ya", "38-katakana-yu", "40-katakana-yo",
  "41-katakana-ra", "42-katakana-ri", "43-katakana-ru", "44-katakana-re", "45-katakana-ro",
  "46-katakana-wa", "50-katakana-wo", "51-katakana-n"
];

// créer la liste des kata en bd, commande en dev pas en prod
router.post("/kanaGen", async (req, res) => {
  try {
    for (let i = 0; i < hiraganaNames.length; i++) {

      const [numK, typeK, nameK] = katakanaNames[i].split("-");
      const [numH, typeH, nameH] = hiraganaNames[i].split("-");

      await new Katakana({
        name: nameK,
        number: numK,     
        type: typeK,        

      }).save();

      await new Hiragana({
        name: nameH,
        number: numH,
        type: typeH,

      }).save();
    }

    res.json({ result: true });

  } catch (error) {
    res.json({ error, message: "erreur d'enregistrement des katas" });
  }
});

module.exports = router;
