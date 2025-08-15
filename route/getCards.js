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
    console.log('filter début');

    let katakanaLimite = 10;
    let hiraganaLimite = 45 + 10;

    // Katakana
    let value = 0;
    for (let i = 0; i <= katakanaLimite && i < 46; i++) {
        value += list[i]?.priority || 0; 
        console.log(value)
    }
    if (value < katakanaLimite/1.25) {
        katakanaLimite += 5;
        value = 0
    }
    
    // Hiragana
    
    value = 0;
    for (let i = 46; i <= hiraganaLimite && i < 92; i++) {
        value += list[i]?.priority || 0; 
    }
    if (value < hiraganaLimite/1.25) {
        hiraganaLimite += 5
        value = 0
    };

    console.log("limites établies", { katakanaLimite, hiraganaLimite });

    let filtered = [
        ...list.filter((_, index) => index < katakanaLimite),
        ...list.filter((_, index) => index > 45 && index < hiraganaLimite)
    ];

    let averageView = filtered.reduce((acc, v) => acc + v.nbViews, 0) / list.length;

    const keepMinSize = (arr, extraFilter) => {
        if (arr.length < nbSlider) {
            return [
                ...arr,
                ...list.filter(extraFilter)
            ];
        }
        return arr;
    };

    if (filterType === "neverViewed") {
        filtered = [...filtered.filter((e, i) =>
            e.nbViews <= averageView || e.priority >= Math.random() || e.isFavorite
        ), ...filtered]
        return filtered;
     }

    if (filterType === "onlyViewed" || filterType === "ChallengeAll") {
        filtered = filtered.filter(e => e.nbViews > 0 || e.isFavorite);
        filtered = [...filtered.filter(e => e.nbViews > averageView || e.isFavorite), ...filtered]
        filtered = [...filtered.filter(e => e.priority >= Math.random() || e.isFavorite), ...filterType];
        return filtered;
    }

    if (filterType === "all") {
        filtered = filtered.filter(e => e.priority >= Math.random() || e.isFavorite);
        return filtered;
    }
}




router.post("/getCards", async (req, res) => {



    const { nbSlider, kataType, filterType, id, isDevMode, token } = req.body

    console.log("1", id, token)
    // ajout token plus tard
    if (!checkBody(req.body, ["id", "token"])) {
        res.json({ result: false, message: "Champs manquants ou vides", error: "Missing or empty fields" });
        return;
    }

    console.log("2")
    // Unviewed Kata Ok
    try {


        // on charge user et on populate les kataProgress selon la demande, qu'on populate a leurs tours des kata correspondants
        let user = await User.findById({ _id: id })
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

        console.log("3", user._id)

        // verification du token
        if (user.token !== token) {
            res.json({ result: false, message: "token invalide", error: "token invalide" });
            return
        }

        console.log("4")

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

        console.log("5")

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

        console.log("6")

        // on retourne la liste des kata selected sans leurs progression
        return res.json({ result: true, data: isDevMode ? selected : selected.map(select => select.hiraganaId || select.katakanaId) })

    } catch (error) {
        return res.json({ result: false, message: "erreur lors de la récuperation des kata", error: error })
    }
})

module.exports = router;
