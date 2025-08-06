var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");

const findModelsType = (req) => {
  return req.body.katakana ? KatakanaProgress : HiraganaProgress
}

const findKataType = (req) => {
  return req.body.katakana ? {katakanaId : req.body.katakana, userId : req.body.userId} : {hiraganaId : req.body.hiragana, userId : req.body.userId}
}

// route pour trouver l'ensemble des Kata progresse d'un user, trié par type
router.get('/userProgress/:userId/:type', async (req, res) => {
      try {
        
      const user = await User.findById({ _id: req.params.userId }).populate({
        path: req.params.type === "katakana" ? "katakanaProgress" : "hiraganaProgress",
        populate: {
            path: req.params.type === "katakana" ? 'katakanaId' : "hiraganaId",
            model: req.params.type === "katakana" ?  'Katakana' : "Hiragana"
       }})
       
        const progress = user[req.params.type === "katakana" ? "katakanaProgress" : "hiraganaProgress"]

      
      res.json(progress)

  } catch (error) {
    res.json(error)
  }
})

// route de lecture d'un KataProgress
router.post('/kataProgress', async (req, res) => {
      try {

        const kataProgress = await (findModelsType(req))
          .findOne(findKataType(req))
          .populate(req.body.katakana ? "katakanaId" : "hiraganaId")

      res.json(kataProgress)

  } catch (error) {
    res.json(error)
  }
})

// route de modification d'un KataProgress
router.patch('/kataProgress/modify', async (req, res) => {

  try {

        let kataProgress = await (findModelsType(req))
          .findOne(findKataType(req))
    
         console.log(kataProgress)

         // fonction pour s'assurer que la valeur ajouté est bien un array, sinon il transforme la nouvelle value en array, ensuite on fusionne les deux array en un seul
         const arrayMerger = (oldArray, newArray) => {
          const newValArray = Array.isArray(newArray) ? newArray : [newArray]
          return [...oldArray, ...newValArray]
         }
         // modification du document trouvé

            kataProgress.isValidated = req.body.isValidated ? req.body.isValidated : kataProgress.isValidated;
            kataProgress.validatedAt = req.body.isValidated ? new Date() : kataProgress.validatedAt;
            kataProgress.responseTime = req.body.responseTime ? arrayMerger( kataProgress.responseTime, req.body.responseTime) : kataProgress.responseTime ;

            // nbViews dépend a la foi du nombre de nbCorrect et nbWrong, chaqu'un si il est incrémenté augmente nbViews
            kataProgress.nbViews =  kataProgress.nbViews + (req.body.nbCorrect ? Number(req.body.nbCorrect) : 0) + (req.body.nbWrong ? Number(req.body.nbWrong) : 0);

            kataProgress.nbCorrect = req.body.nbCorrect ? kataProgress.nbCorrect + Number(req.body.nbCorrect) : kataProgress.nbCorrect;
            kataProgress.nbWrong = req.body.nbWrong ? kataProgress.nbWrong + Number(req.body.nbWrong) : kataProgress.nbWrong;
            kataProgress.isFavorite = req.body.isFavorite ? req.body.isFavorite : kataProgress.isFavorite;
            kataProgress.priority = Math.max(kataProgress.nbWrong / kataProgress.nbViews, (1 - kataProgress.nbCorrect/10))

          const saveResult = await kataProgress.save()

          console.log('save : ' , kataProgress)

    res.json({result : true, saveResult})

  } catch (error) {
    res.json({result : false, error : error})
  }
})

module.exports = router;
