var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");

router.post("/exosNewKataORHira", async (req, res) =>{

    // ajout token plus tard
    if (!checkBody(req.body, ["id", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    const nbKata = Number(req.body.katakana)
    const nbHira = Number(req.body.hiragana)
    const nbViewsKata = Number(req.body.nbViews)

    console.log("la:", nbViewsKata)

})

router.post("/exosAllKataORHira", async (req, res) => {

                            // ajout token plus tard
    if (!checkBody(req.body, ["id", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }
            // changer nom plus explicite que req.body.katakana genre req.body.NbCurseur? Des avis?
    const nbKata = Number(req.body.katakana)
    const nbHira = Number(req.body.hiragana)

    if (req.body.katakana && !isNaN(nbKata)) {
        try {
            let user = await User.findById({_id: req.body.id})
            .populate("katakanaProgress")

            let kataAll = await Katakana.find();
            let kataProgList = user.katakanaProgress;


            // fusion kataAll et kataProgress par un map
            let kataAllWithProgress = kataAll.map(kata => {
                // p = 1 kataProgress de user
                let prog = kataProgList.find(p => p.katakanaId.toString() === kata._id.toString());
                return {
                    ...kata.toObject(),
                    progression: prog || null
                };
            })

            let selected = [];
                // 
            for (let i = 0  ; i < nbKata && kataAllWithProgress.length > 0 ; i++){

                const randomIndex = Math.floor(Math.random() * kataAllWithProgress.length);

                selected.push(kataAllWithProgress[randomIndex])
                kataAllWithProgress.splice(randomIndex, 1)
            }

            return res.json(selected)
        } catch(error) {
            return res.json(error)
        }}

    else if (req.body.hiragana) {
        try {

            let user = await User.findById({_id: req.body.id})
            .populate("hiraganaProgress")

            let hiraAll = await Hiragana.find();
            let hiraProgList = user.hiraganaProgress;

            // fusion hiraAll et hiraProgress
            let hiraAllWithProgress = hiraAll.map(hira => {
                // p = 1 hiraProgress de user
                let prog = hiraProgList.find(p => p.hiraganaId.toString() === hira._id.toString());
                return {
                    ...hira.toObject(),
                    progression: prog || null
                };
            })

            let selected = [];

            for (let i = 0  ; i < nbHira && hiraAllWithProgress.length > 0 ; i++){
                const randomIndex = Math.floor(Math.random() * hiraAllWithProgress.length);
                selected.push(hiraAllWithProgress[randomIndex])
                hiraAllWithProgress.splice(randomIndex, 1)
            }
            return res.json(selected)
        } catch(error) {
            return res.json(error)
    }}

    res.json({result: false})


})

router.post("/exosAllKataANDHira", async (req, res) =>{
    
})






module.exports = router;