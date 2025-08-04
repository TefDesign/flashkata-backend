var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana")
const Hiragana = require("../models/Hiragana")
const katakanaProgress = require("../models/katakanaProgress")
const hiraganaProgress = require("../models/hiraganaProgress");
const { checkBody } = require("../modules/checkBody");



// User.findOne() -> email
// verif token
// populate UserProgress zvec kataProgress et HiraganaProgress

router.post("/userProgress", async (req, res) => {

    if (!checkBody(req.body, ["email", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }





    // recherche par katakana
    if (req.body.katakana) {

        const user = await User.findOne({ email: req.body.email })
            .populate("katakanaProgress")
        console.log(user.katakanaProgress.map(kata => kata.katakanaId.toString()))
        const katakana = user.katakanaProgress.find(kata => kata.katakanaId.toString() === req.body.katakana)
        console.log(katakana)
        res.json({'katakanaProgress': katakana})



        // recherche par hiragana
    } else if (req.body.hiragana) {
        console.log(req.body.hiragana)
        const user = await User.findOne({ email: req.body.email })
            .populate("hiraganaProgress")
        console.log(user.hiraganaProgress.map(hira => hira.hiraganaId.toString()))
        const hiragana = user.hiraganaProgress.find(hira => hira.hiraganaId.toString() === req.body.hiragana)
        console.log(hiragana)
        res.json({'hiraganaProgress': hiragana})



        // recherche globale
    } else {

        try {
        const user = await User.findOne({ email: req.body.email })
            .populate("hiraganaProgress")
            .populate("katakanaProgress")


            console.log(user)
            res.json({
                "hiraganaProgress" : user.hiraganaProgress,
                "katakanaProgress" : user.katakanaProgress
            })
            
        } catch (error){
            console.log(error)
        }
    }


    
})




module.exports = router;