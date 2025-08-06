var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");


router.post("/exos", async (req, res) => {


                            // ajout token plus tard
    if (!checkBody(req.body, ["id", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    const nbKata = Number(req.body.katakana)
    const nbHira = Number(req.body.hiragana)

    if (req.body.katakana && !isNaN(nbKata)) {
        try {
            let user = await User.findById({_id: req.body.id})
            .populate("katakanaProgress")

            let kataAll = await Katakana.find();
            let kataProgList = user.katakanaProgress;

            // fusion kataAll et kataProgress
            let kataAllWithProgress = kataAll.map(kata => {
                // p = 1 kataProgress de user
                let prog = kataProgList.find(p => p.katakanaId.toString() === kata._id.toString());
                return {
                    ...kata.toObject(),
                    progression: prog || null
                };
            })

            let selected = [];

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
            let hiraAll = await Hiragana.find();
            let selected = [];
            // selected = hiraAll.filter((hira, i) => {return Math.random() < 0.1 ? hira: null})
            for (let i = 0  ; i < Number(req.body.hiragana) ; i++){
                const hiraNbSelect = hiraAll[Math.floor(Math.random() * hiraAll.length)]
                selected.push(hiraNbSelect);
                hiraAll = hiraAll.filter((hira, i) => {return i !== hiraNbSelect ? hira: null})
            }
            return res.json(selected)
        } catch(error) {
            return res.json(error)
    }}

    res.json({result: false})


})






module.exports = router;