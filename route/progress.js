var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");

// liste des champs modifiable dans katakana et hiragana Progress
const listeModifiable = [
  "isValidated",
  "responseTime",
  "nbViews",
  "nbCorrect",
  "nbWrong",
  "isFavorite",
];

// User.findOne() -> email
// verif token
// populate UserProgress zvec kataProgress et HiraganaProgress

router.post("/userProgress", async (req, res) => {
  // on verifie l'utilisateur , remplacer password par token
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // si req.body contien un champ katakana on fait une recherche de katakana
  if (req.body.katakana) {
    try {
      const user = await User.findOne({ email: req.body.email }).populate({
        path: 'katakanaProgress',
        populate: {
            path: 'katakanaId',
            model: 'Katakana'
  }
    });

      // on recherche le katakanaProgress par un Id de Katakana
      const kataProgress = user.katakanaProgress.find(
        (kata) => kata.katakanaId._id.toString() === req.body.katakana
      );

      // on verfie si un champs de modification est présent dans le body de la requette, si oui, on passe a la modification
      if (listeModifiable.find((value) => req.body[value]) && kataProgress) {
        /* section de modification du katakanaProgress: 
              on récupère les valeurs précédentes du kata, 
              et on lui ajoute les valeur dans le req.body correspondante       */
        const newKatakanaValue = {
          katakanaId: kataProgress.katakanaId,
          userId: kataProgress.userId,
          name: kataProgress.name,

          // validation du kata
          isValidated: req.body.isValidated
            ? req.body.isValidated
            : kataProgress.isValidated,
          validatedAt: req.body.isValidated
            ? new Date()
            : kataProgress.validatedAt,

          // temps de réponse au kata
          responseTime: kataProgress.responseTime,

          // nombre de fois ou l'utilisateur a vue le kata : nb view augmente en fonction des nbCorrect ou wrong
          nbViews: (req.body.nbCorrect || req.body.nbWrong)
            ? (req.body.nbCorrect ?  Number(req.body.nbCorrect) : 0) + (req.body.nbWrong ?  Number(req.body.nbWrong) : 0) + kataProgress.nbViews
            : kataProgress.nbViews,

          // nombre de fois ou l'utilisateur a répondu correctement au kata
          nbCorrect: req.body.nbCorrect
            ? Number(req.body.nbCorrect) + kataProgress.nbCorrect
            : kataProgress.nbCorrect,

          // nombre de fois ou l'utilisateur a répondu incorrectement au kata
          nbWrong: req.body.nbWrong
            ? Number(req.body.nbWrong) + kataProgress.nbWrong
            : kataProgress.nbWrong,

          // si le kata est favori
          isFavorite: req.body.isFavorite
            ? req.body.isFavorite
            : kataProgress.isFavorite,
        };
        const modified = await KatakanaProgress.updateOne(
          { _id: kataProgress._id },
          newKatakanaValue
        );

        res.json(
          modified.modifiedCount > 0
            ? { result: true, newKatakanaValue }
            : { result: false }
        );
      }
      //fin de la section de modification

      // si le kataProgress demandé n'est pas trouvé avec son id en renvoi la liste des kataProgress
      let progressListe;
      if (!kataProgress) {
        progressListe = user.katakanaProgress.map((kata) => {
          return {
            kata,
          };
        });
      }

      // si katakana trouvé on retourne le katakanaProgress, sinon la liste complete
      res.json(
        kataProgress
          ? { kataProgress: kataProgress }
          : { "liste des kata": progressListe }
      );
    } catch (error) {
      res.json(error);
    }

    // recherche par hiragana
  } else if (req.body.hiragana) {
    try {
      const user = await User.findOne({ email: req.body.email }).populate({
        path : "hiraganaProgress",
        populate : {
            path : 'hiraganaId',
            model : 'Hiragana'
        }
      });


      // on recherche le katakanaProgress par un Id de Katakana
      const hiraProgress = user.hiraganaProgress.find(
        (hira) => hira.hiraganaId._id.toString() === req.body.hiragana
      );

      // on verfie si un champs de modification est présent dans le body de la requette, si oui, on passe a la modification
      if (listeModifiable.find((value) => req.body[value]) && hiraProgress) {
        /* section de modification du hiraganaProgress: 
              on récupère les valeurs précédentes du kata, 
              et on lui ajoute les valeur dans le req.body correspondante       */
        const newHiraganaValue = {
          hiraganaId: hiraProgress.hiraganaId,
          userId: hiraProgress.userId,
          name: hiraProgress.name,

          // validation du kata
          isValidated: req.body.isValidated
            ? req.body.isValidated
            : hiraProgress.isValidated,
          validatedAt: req.body.isValidated
            ? new Date()
            : hiraProgress.validatedAt,

          // temps de réponse au kata
          responseTime: hiraProgress.responseTime,

          // nombre de fois ou l'utilisateur a vue le kata : nb view augmente en fonction des nbCorrect ou wrong
          nbViews: (req.body.nbCorrect || req.body.nbWrong )
            ?(req.body.nbCorrect ? Number(req.body.nbCorrect) : 0 ) + (req.body.nbWrong ? Number(req.body.nbWrong) : 0) + hiraProgress.nbViews
            : hiraProgress.nbViews,

          // nombre de fois ou l'utilisateur a répondu correctement au kata
          nbCorrect: req.body.nbCorrect
            ? Number(req.body.nbCorrect) + hiraProgress.nbCorrect
            : hiraProgress.nbCorrect,

          // nombre de fois ou l'utilisateur a répondu incorrectement au kata
          nbWrong: req.body.nbWrong
            ? Number(req.body.nbWrong) + hiraProgress.nbWrong
            : hiraProgress.nbWrong,

          // si le kata est favori
          isFavorite: req.body.isFavorite
            ? req.body.isFavorite
            : hiraProgress.isFavorite,
        };
        const modified = await HiraganaProgress.updateOne(
          { _id: hiraProgress._id },
          newHiraganaValue
        );

        res.json(
          modified.modifiedCount > 0
            ? { result: true, newHiraganaValue }
            : { result: false }
        );
      }
      //fin de la section de modification

      // si le kataProgress demandé n'est pas trouvé avec son id en renvoi la liste des kataProgress
      let progressListe;
      if (!hiraProgress) {
        progressListe = user.hiraganaProgress.map((hira) => {
          return {
            name: hira.name,
            id: hira.hiraganaId,
          };
        });
      }

      // si katakana trouvé on retourne le katakanaProgress, sinon la liste complete
      res.json(
        hiraProgress
          ? { hiraganaProgress: hiraProgress }
          : { "liste des hiragana": progressListe }
      );
    } catch (error) {
      res.json(error);
    }

    // recherche global : si aucun champ katakana ou hiragana n'est renseigné, on renvoi la liste et katakana et des hiragana
  } else {
    try {
      const user = await User.findOne({ email: req.body.email })
        .populate({
            path : "hiraganaProgress",
            populate : {
                path : "hiraganaId",
                model : "Hiragana"
            }
        })
        .populate({
            path : "katakanaProgress",
            populate : {
                path : "katakanaId", 
                model : "Katakana"
            }
        });

      console.log(user);
      res.json({
        hiraganaProgress: user.hiraganaProgress,
        katakanaProgress: user.katakanaProgress,
      });
    } catch (error) {
      console.log(error);
    }
  }
});

module.exports = router;
