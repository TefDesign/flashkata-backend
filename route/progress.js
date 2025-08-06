var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");


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


router.post('/kataProgress', async (req, res) => {
      try {

        const kataProgress = await (req.body.katakana  ? KatakanaProgress : HiraganaProgress)
          .findOne(req.body.katakana ? {katakanaId : req.body.katakana, userId : req.body.userId} : {hiraganaId : req.body.hiragana, userId : req.body.userId})
          .populate(req.body.katakana ? "katakanaId" : "hiraganaId")
      


      res.json(kataProgress)

  } catch (error) {
    res.json(error)
  }
})



router.patch('/kataProgress/modify', async (req, res) => {

  try {

        const kataProgress = await (req.body.katakana ? KatakanaProgress : HiraganaProgress)
          .findOne(req.body.katakana ? {katakanaId : req.body.katakana, userId : req.body.userId} : {hiraganaId : req.body.hiragana, userId : req.body.userId})
    
         console.log(kataProgress)
         // fonction pour s'assurer que la valeur ajouté est bien un array, sinon il transforme la nouvelle value en array, ensuite on fusionne les deux array en un seul
         const arrayMerger = (oldArray, newArray) => {
          const newValArray = Array.isArray(newArray) ? newArray : [newArray]
          return [...oldArray, ...newValArray]
         }

         // creation d'une copie et modification du document trouvé
          const newValue = {

            isValidated: req.body.isValidated ? req.body.isValidated : kataProgress.isValidated,
            validatedAt: req.body.isValidated ? new Date() : kataProgress.validatedAt,
            responseTime: req.body.responseTime ? arrayMerger( kataProgress.responseTime, req.body.responseTime) : kataProgress.responseTime ,

            // nbViews dépend a la foi du nombre de nbCorrect et nbWrong, chaqu'un si il est incrémenté augmente nbViews
            nbViews:  kataProgress.nbViews + (req.body.nbCorrect ? Number(req.body.nbCorrect) : 0) + (req.body.nbWrong ? Number(req.body.nbWrong) : 0),


            nbCorrect: req.body.nbCorrect ? kataProgress.nbCorrect + Number(req.body.nbCorrect) : kataProgress.nbCorrect,
            nbWrong: req.body.nbWrong ? kataProgress.nbWrong + Number(req.body.nbWrong) : kataProgress.nbWrong,
            isFavorite: req.body.isFavorite ? req.body.isFavorite : kataProgress.isFavorite,
          }
          console.log('new value : ', newValue)

      const saveNewValue = await (req.body.katakana  ? KatakanaProgress : HiraganaProgress)
          .updateOne(req.body.katakana ? {katakanaId : req.body.katakana, userId : req.body.userId} : {hiraganaId : req.body.hiragana, userId : req.body.userId}, newValue)

          console.log('save : ' , saveNewValue)


    res.json({result : true , newValue, saveNewValue})

  } catch (error) {
    res.json({result : false, error : error})
  }
})

module.exports = router;
