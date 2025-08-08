var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");

// fonction pour filtrer les cartes en fonction du type de filtre et de leurs priorités
function filter(filterType, list, nbSlider) {

    let averageView = list.reduce((acc, value) => value.nbViews + acc, 0) / list.length
    let filtered;

    if (filterType === "neverViewed") {

        filtered = list.filter(e => { return e.nbViews <= 0 })
        filtered && filtered.length > nbSlider ? null : filtered = list.filter(e => { return (e.nbViews < averageView && e.priority >= Math.random()) || e.isFavorite })

        return filtered
    }

    else if (filterType === "onlyViewed" || filterType === "ChallengeAll") {
        filtered = list.filter(e => { return e.nbViews > 0 || e.isFavorite})
        filtered && filtered.length > nbSlider ? null : filtered = list.filter(e => { return e.nbViews > averageView || e.isFavorite })
        filtered = filtered.filter(e => { return e.priority >= Math.random() || e.isFavorite})

        return filtered
    }

    else if (filterType === "all") {
        filtered = list.filter(e => { return ( e.priority >= Math.random()) || e.isFavorite})

        return filtered
    }
}



router.post("/giveMeSomeCards", async (req, res) => {

     
    // ajout token plus tard
    if (!checkBody(req.body, ["id", "token"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }
    const nbSlider = Number(req.body.nbSlider) // Choix du nb de kata par le slider

    // Unviewed Kata Ok
    try {

        const kataType = req.body.kataType
        const filterType = req.body.filterType

        // on charge user et on populate les kataProgress selon la demande, qu'on populate a leurs tours des kata correspondants
        let user = await User.findById({ _id: req.body.id })
            kataType === "hiragana" || kataType === "all" ? await user.populate({
                path: "hiraganaProgress",
                populate: {
                    path: "hiraganaId",
                    model: "Hiragana"
                }
            }) : null
            kataType === "katakana" || kataType === "all" ? await user.populate({
                path: "katakanaProgress",
                populate: {
                    path: 'katakanaId',
                    model: 'Katakana'
                }
            }) : null

        // verification du token
         if (user.token !== req.body.token) {
            res.json({ result: false, error: "token invalide" });
            return
        }

        // creation de la liste non filtrée
        let list = [];
        if (kataType === "katakana" || kataType === "all") {
            list = [...list, ...user.katakanaProgress]
        }
        if (kataType === "hiragana" || kataType === "all") {
            list = [...list, ...user.hiraganaProgress]
        }

        // on filtre la liste en fonction du type de filtre demandé
        let filtered = filter(filterType, list, nbSlider);


        //  selection des cartes
        let selected = [];

        for (let i = 0; i < nbSlider; i++) {

            if (filtered.length > 0) {

                const randomIndex = Math.floor(Math.random() * filtered.length);
                selected.push(filtered[randomIndex])
                filtered.splice(randomIndex, 1)

            } else {

                const randomIndex = Math.floor(Math.random() * list.length);
                selected.push(list[randomIndex])
                list.splice(randomIndex, 1)

            }
        }

        // on retourne la liste des kata selected sans leurs progression
        return res.json({ result: true, data: req.body.dev ? selected : selected.map(select => select.hiraganaId || select.katakanaId )})

    } catch (error) {
        return res.json({result : false , error : error})
    }
})

module.exports = router;
