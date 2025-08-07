var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");


router.post("/UnviewedCard", async (req, res) =>{

         // ajout token plus tard
    if (!checkBody(req.body, ["id", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    const nbKata = Number(req.body.NbByCursorKata) // Choix du nb de kata par le curseur
    const nbHira = Number(req.body.NbByCursorHira) // Nb
    
    const NewBatchKata = req.body.needNewBatchKata // Nouveau lot de cartes?
    const NewBatchHira = req.body.needNewBatchHira // Booléen
    
    const onlyViewedKata = req.body.onlyViewedKata // Cartes déjà vu?
    const onlyViewedHira = req.body.onlyViewedHira // Booléen

// If unviewed Kata ok
    if (req.body.NbByCursorKata && onlyViewedKata === "false" && !isNaN(nbKata)) {
        try {

            // Chargé User et populate le progress dans User
            let user = await User.findById({_id: req.body.id})
            .populate("katakanaProgress")


            // 
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

console.log("step3 good")
console.log("progression", kataAllWithProgress[0].progression.nbViews)


            let filtered = []

            const KataProgressByUnviewed = kataAllWithProgress.filter(e =>  { return e.progression.nbViews <= 0})
            filtered.push(...KataProgressByUnviewed)


console.log("step4 good")
console.log("filtered", filtered.length)


            //  
            let selected = [];

            for (let i = 0 ; i < nbKata && filtered.length > 0; i++){

                const randomIndex = Math.floor(Math.random() * filtered.length);

                selected.push(filtered[randomIndex])
                filtered.splice(randomIndex, 1)
            }


console.log("step5 good")
console.log("selected", selected.length)

            return res.json(selected)

        } catch(error) {
            
            return res.json(error)
        }
    }

// Else If unviewed Hira not ok
    else if(req.body.onlyViewedHira && onlyViewedHira === "false" && !isNaN(nbHira)){

    }



})

router.post("/OnlyViewedCard", async (req, res) => {

                            // ajout token plus tard
    if (!checkBody(req.body, ["id", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    const nbKata = Number(req.body.NbByCursorKata)
    const nbHira = Number(req.body.NbByCursorHira)
    
    const NewBatchKata = req.body.needNewBatchKata
    const NewBatchHira = req.body.needNewBatchHira
    
    const onlyViewedKata = req.body.onlyViewedKata
    const onlyViewedHira = req.body.onlyViewedHira

    if (req.body.NbByCursorKata && !isNaN(nbKata)) {
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

    else if (req.body.NbByCursorHira && !isNaN(nbHira)) {
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

router.post("/Viewed&Unviewed", async (req, res) =>{
    
})






module.exports = router;