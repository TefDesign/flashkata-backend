var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const Katakana = require('../models/Katakana');
const Hiragana = require('../models/Hiragana');
const { checkBody } = require("../modules/checkBody");
const { response } = require("../modules/response")
const { createProgress } = require("../modules/createProgress")

// choix du modèle en fonction du body de la requête
const findModelsType = (req) => {
  return req.body.katakana ? KatakanaProgress : HiraganaProgress
}

// modifie le champ de recherche en fonction du body de la requête
const findKataType = (req) => {
  return req.body.katakana ? { katakanaId: req.body.katakana, userId: req.body.userId } : { hiraganaId: req.body.hiragana, userId: req.body.userId }
}


router.patch('/reset', async (req, res) => {

  if (!checkBody(req.body, ["token", "id"])) {
    res.json({ result: false, message: "Champs manquants ou vides", error: "Missing or empty fields" });
    return;
  }

  try {
    const resetUser = await User.findOne({ _id: req.body.id })

    if (!resetUser) {
      res.json({ result: false, message: "Utilisateur non trouvé" });
      return;
    }

    // Supprimer tous les progress hiragana de l'utilisateur
    console.log('Suppression des hiragana progress...');
    const hiraganaIds = resetUser.hiraganaProgress.map(progress => progress._id);
    await HiraganaProgress.deleteMany({ _id: { $in: hiraganaIds } });

    // Supprimer tous les progress katakana de l'utilisateur  
    console.log('Suppression des katakana progress...');
    const katakanaIds = resetUser.katakanaProgress.map(progress => progress._id);
    await KatakanaProgress.deleteMany({ _id: { $in: katakanaIds } });

    console.log('Suppressions terminées, création des nouveaux progress...');

    // on cherche la liste des katakana et on boucle pour créer une liste de katakana progress
    const katakanaList = await Katakana.find({});
    const kataProgress = await createProgress({
      list: katakanaList,
      userId: resetUser._id,
      ProgressModel: KatakanaProgress,
      idField: "katakanaId",
    });

    // on cherche la liste des hiragana et on boucle pour créer une liste de hiragana progress
    const hiraganaListe = await Hiragana.find({});
    const hiraProgress = await createProgress({
      list: hiraganaListe,
      userId: resetUser._id,
      ProgressModel: HiraganaProgress,
      idField: "hiraganaId",
    });
    console.log('creation progress ok')

    // on ajoute les listes de progress dans l'utilisateur
    resetUser.hiraganaProgress = hiraProgress;
    resetUser.katakanaProgress = kataProgress;

    // on sauvegarde l'utilisateur
    await resetUser.save();
    console.log('sauvegarde user en bd')
    res.json({
      result: true,
      token: resetUser.token,
      userName: resetUser.userName,
      id: resetUser._id,
      isConnected: true,
      user: resetUser,
    });

  } catch (error) {
    console.error('Erreur lors du reset:', error);
    res.json({
      result: false,
      message: "Erreur lors de la réinitialisation des progrès",
      error: error.message
    });
  }
})



// route pour trouver l'ensemble des Kata progresse d'un user, trié par type (si pas katakana dans type, renverra la liste des hiragana)
router.get('/userProgress/:token/:id/:type', async (req, res) => {
  try {

    const { type, token, id } = req.params

    const user = await User.findById({ _id: id }).populate({
      path: type === "katakana" ? "katakanaProgress" : "hiraganaProgress",
      populate: {
        path: type === "katakana" ? 'katakanaId' : "hiraganaId",
        model: type === "katakana" ? 'Katakana' : "Hiragana"
      }
    })

    const progress = user[type === "katakana" ? "katakanaProgress" : "hiraganaProgress"]


    res.json(response(user.token, token, progress))

  } catch (error) {
    res.json({ message: "erreur de récuperation de la liste des progrès", error })
  }
})

// route de lecture d'un KataProgress
router.post('/kataProgress', async (req, res) => {
  try {
    if (!checkBody(req.body, ["userId", "token"])) {
      res.json({ result: false, message: "Champs manquants ou vides", error: "Missing or empty fields" });
      return;
    }

    const kataProgress = await (findModelsType(req))
      .findOne(findKataType(req))
      .populate(req.body.katakana ? "katakanaId" : "hiraganaId")
      .populate('userId')

    res.json(response(kataProgress.userId.token, req.body.token, kataProgress))

  } catch (error) {
    res.json({ error: error, message: "erreur inconnu" })
  }
})

// route de modification d'un KataProgress
router.patch('/kataProgress/modify', async (req, res) => {
  try {
    if (!checkBody(req.body, ["userId", "token"])) {
      res.json({ result: false, error: "Missing or empty fields" });
      return;
    }


    let kataProgress = await (findModelsType(req))
      .findOne(findKataType(req))
      .populate('userId')

    //  vérification du token en amont de la réponse pour éviter la modification
    if (kataProgress.userId.token !== req.body.token) {
      res.json({ result: false, message: "erreur de token", error: "invalid token" })
      return
    }

    // fonction pour s'assurer que la valeur ajoutée est bien un array, sinon il transforme la nouvelle valeur en array, ensuite on fusionne les deux arrays en un seul
    const arrayMerger = (oldArray, newArray) => {
      const newValArray = Array.isArray(newArray) ? newArray : [newArray]
      return [...oldArray, ...newValArray]
    }

    // modification du document trouvé

    kataProgress.isValidated = req.body.isValidated ? req.body.isValidated : kataProgress.isValidated;
    kataProgress.validatedAt = req.body.isValidated ? new Date() : kataProgress.validatedAt;
    kataProgress.responseTime = req.body.responseTime ? arrayMerger(kataProgress.responseTime, req.body.responseTime) : kataProgress.responseTime;

    // nbViews dépend à la fois du nombre de nbCorrect et nbWrong, chacun s'il est incrémenté augmente nbViews
    kataProgress.nbViews = kataProgress.nbViews + (req.body.nbCorrect ? Number(req.body.nbCorrect) : 0) + (req.body.nbWrong ? Number(req.body.nbWrong) : 0);

    kataProgress.nbCorrect = req.body.nbCorrect ? kataProgress.nbCorrect + Number(req.body.nbCorrect) : kataProgress.nbCorrect;
    kataProgress.nbWrong = req.body.nbWrong ? kataProgress.nbWrong + Number(req.body.nbWrong) : kataProgress.nbWrong;
    kataProgress.isFavorite = req.body.isFavorite
    kataProgress.priority = Math.max(kataProgress.nbWrong / kataProgress.nbViews, (1 - kataProgress.nbCorrect / 10)) || 0


    console.log('save : ', kataProgress)

    const saveResult = await kataProgress.save()


    res.json(response(kataProgress.userId.token, req.body.token, saveResult))


  } catch (error) {
    res.json({ result: false, message: 'erreur inconu', error: error })
  }
})

module.exports = router;
