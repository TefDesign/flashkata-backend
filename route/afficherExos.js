var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const KatakanaProgress = require("../models/KatakanaProgress");
const HiraganaProgress = require("../models/HiraganaProgress");
const { checkBody } = require("../modules/checkBody");

const { switcherType } = require("../modules/switcherType")


function filter (filterType, moy, kataAllWithProgress, nbCursor) {

    
    let filtered;
   
    if (filterType === "neverViewed"){

    filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews <= 0})
    filtered && filtered.length > nbCursor ? null : filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews < moy})

    return filtered
}
    

    else if (filterType === "onlyViewed")
    {
        filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews > 0})
        filtered && filtered.length > nbCursor ? null : filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews > moy})
        return filtered
    }

    else if (filterType === "all")
    {
        filtered = kataAllWithProgress
        // filtered && filtered.length > nbCursor ? null : filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews < moy})
        return filtered
    }
    else if (filterType === "ChallengeAll")
        {
            filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews > 0})
        filtered && filtered.length > nbCursor ? null : filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews > moy})
        return filtered
        }

}



router.post("/giveMeSomeCards", async (req, res) =>{

     // ajout token plus tard
if (!checkBody(req.body, ["id", "token"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
}
    const nbCursor = Number(req.body.NbByCursor) // Choix du nb de kata par le curseur

// Unviewed Kata Ok
        try {
            
            const kataType = req.body.kataType
            const filterType = req.body.filterType
           
            // Chargé User et populate le progress dans User
            let user = await User.findById({_id: req.body.id})
            kataType === "hiragana" || kataType === "all" ? await user.populate("hiraganaProgress") : null
            kataType === "katakana" || kataType === "all" ? await user.populate("katakanaProgress") : null

            if (user.token !== req.body.token) {
                res.json({result: false, error: "token invalide"})
                return
            }
            // 
            let kataAll = [];
            
            if (kataType === "katakana" || kataType === "all"){
                const kata = await Katakana.find()
                kataAll = [...kataAll, ...kata]
            }
            
            if (kataType === "hiragana" || kataType === "all"){
                const kata = await Hiragana.find()
                kataAll = [...kataAll, ...kata]
            }
       
// Incrémentation progression

            let kataProgList = [];

            if (kataType === "katakana" || kataType === "all"){
                kataProgList = [...kataProgList, ...user.katakanaProgress]
            }
            
            if (kataType === "hiragana" || kataType === "all"){
                kataProgList = [...kataProgList, ...user.hiraganaProgress]
            }

console.log("kaaaa", kataProgList.length)

// Fusion kataAll et progress

            let kataAllWithProgress = kataAll.map(kata => {

                let prog;

                if (kataProgList.some(p => p.katakanaId?.toString() === kata._id.toString())){

                    prog = kataProgList?.find(p => p.katakanaId?.toString() === kata._id.toString()); 

                    return {
                    ...kata.toObject(),
                    progression: prog || null
                };

                }
                
                if (kataProgList.some(p => p.hiraganaId?.toString() === kata._id.toString())){
                    prog = kataProgList?.find(p => p.hiraganaId?.toString() === kata._id.toString());
                    
                    return {
                    ...kata.toObject(),
                    progression: prog || null
                };

                }
            })

console.log("step3 good", kataAllWithProgress.length)

            let moy = kataAllWithProgress.reduce((acc, value) => value.progression.nbViews + acc,0)/kataAllWithProgress.length

            let filtered = filter(filterType, moy, kataAllWithProgress, nbCursor);


console.log("step4 good")
console.log("filtered", filtered.length)
console.log("moy", moy)


            //  
            let selected = [];

            for (let i = 0 ; i < nbCursor; i++){

                if(filtered.length > 0){

                    const randomIndex = Math.floor(Math.random() * filtered.length);

                    selected.push(filtered[randomIndex])
                    filtered.splice(randomIndex, 1)
                } else {

                    const randomIndex = Math.floor(Math.random() * kataAllWithProgress.length);

                    selected.push(kataAllWithProgress[randomIndex])
                    kataAllWithProgress.splice(randomIndex, 1)
                }
                
            }


console.log("step5 good")
// console.log("selected", selected.length)

            return res.json(selected)

        } catch(error) {
            
            return res.json(error)
        }
})







module.exports = router;