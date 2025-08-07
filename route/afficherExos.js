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




router.post("/UnviewedCard", async (req, res) =>{

     // ajout token plus tard
if (!checkBody(req.body, ["id", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
}

    const nbCursor = Number(req.body.NbByCursor) // Choix du nb de kata par le curseur

    const NewBatch = req.body.needNewBatch // Booléen
    
    const onlyViewedKata = req.body.onlyViewedKata // Cartes déjà vu?
    const onlyViewedHira = req.body.onlyViewedHira // Booléen

// Unviewed Kata Ok
// req.body.NbByCursorKata && onlyViewedKata === "false" && !isNaN(nbCursor)
if (true) {
        try {
            
            const type = req.body.type

            // Chargé User et populate le progress dans User
            let user = await User.findById({_id: req.body.id})
            type === "hiragana" || type === "All" ? await user.populate("hiraganaProgress") : null
            type === "katakana" || type === "All" ? await user.populate("katakanaProgress") : null

console.log("t1", user)
            // 
            let kataAll = [];
            
            if (type === "katakana" || type === "All"){
                const kata = await Katakana.find()
                kataAll = [...kataAll, ...kata]
            }
            
            if (type === "hiragana" || type === "All"){
                const kata = await Hiragana.find()
                kataAll = [...kataAll, ...kata]
            }
       
// console.log("ggg", kataAll.length)

            let kataProgList = [];

            if (type === "katakana" || type === "All"){
                kataProgList = [...kataProgList, ...user.katakanaProgress]
            }
            
            if (type === "hiragana" || type === "All"){
                kataProgList = [...kataProgList, ...user.hiraganaProgress]
            }

console.log("kaaaa", kataProgList.length)
        

            // fusion kataAll et kataProgress par un map

            let kataAllWithProgress = kataAll.map(kata => {

                console.log("l")

                let prog;
                console.log("pr", kataProgList.some(p => p.katakanaId === kata._id))

                if (kataProgList.some(p => p.katakanaId === kata._id)){
                    console.log("untruc")
                    prog = kataProgList.find(p => p.katakanaId.toString() === kata._id.toString()); 
                }
                
                if (kataProgList.some(p => p.hiraganaId.toString() === kata._id.toString())){
                    console.log("unautretruc")
                    prog = kataProgList.find(p => p.hiraganaId.toString() === kata._id.toString());
                }


                return {
                    ...kata.toObject(),
                    progression: prog || null
                };
            })

console.log("step3 good")

// console.log("progression", kataAllWithProgress[0].progression.nbViews)


            let moy = kataAllWithProgress.reduce((acc, value) => value.progression.nbViews + acc,0)/kataAllWithProgress.length

            let filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews <= 0})
            filtered && filtered.length > nbCursor ? null : filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews < moy})


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
}

// Unviewed Hira Ok
if (req.body.NbByCursorHira && onlyViewedHira === "false" && !isNaN(nbCursor)) {
    try {

        // Chargé User et populate le progress dans User
        let user = await User.findById({_id: req.body.id})
        .populate("hiraganaProgress")


        // 
        let hiraAll = await Hiragana.find();
        let hiraProgList = user.hiraganaProgress;

        // fusion hiraAll et hiraProgress par un map
        let hiraAllWithProgress = hiraAll.map(hira => {
            // p = 1 hiraProgress de user
            let prog = hiraProgList.find(p => p.hiraganaId.toString() === hira._id.toString());
            return {
                ...hira.toObject(),
                progression: prog || null
            };
        })

// console.log("step3 good")
// console.log("progression", hiraAllWithProgress[0].progression.nbViews)


        let moy = hiraAllWithProgress.reduce((acc, value) => value.progression.nbViews + acc,0)/hiraAllWithProgress.length

        let filtered = hiraAllWithProgress.filter(e =>  { return e.progression.nbViews <= 0})
        filtered && filtered.length > nbHira ? null : filtered = hiraAllWithProgress.filter(e =>  { return e.progression.nbViews < moy})


console.log("step4 good")
console.log("filtered", filtered.length)
console.log("moy", moy)


        //  
        let selected = [];

        for (let i = 0 ; i < nbHira; i++){

            if(filtered.length > 0){

                const randomIndex = Math.floor(Math.random() * filtered.length);

                selected.push(filtered[randomIndex])
                filtered.splice(randomIndex, 1)
            } else {

                const randomIndex = Math.floor(Math.random() * hiraAllWithProgress.length);

                selected.push(hiraAllWithProgress[randomIndex])
                hiraAllWithProgress.splice(randomIndex, 1)
            }
            
        }


// console.log("step5 good")
// console.log("selected", selected.length)

        return res.json(selected)

    } catch(error) {
        
        return res.json(error)
    }
}

})

router.post("/OnlyViewedCard", async (req, res) => {

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

    
// Viewed Kata Ok
    if (req.body.NbByCursorKata && onlyViewedKata === "true" && !isNaN(nbKata) && NewBatchKata) {
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

// console.log("step3 good")
// console.log("progression", kataAllWithProgress[0].progression.nbViews)

            let moy = kataAllWithProgress.reduce((acc, value) => value.progression.nbViews + acc,0)/kataAllWithProgress.length

            let filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews > 0})
            filtered && filtered.length > nbKata ? null : filtered = kataAllWithProgress.filter(e =>  { return e.progression.nbViews >= moy})


// console.log(kataAllWithProgress)
// console.log(moy)
console.log("step4 good")
console.log("filtered", filtered.length)


            //  
            let selected = [];

            for (let i = 0 ; i < nbKata; i++){

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
console.log("selected", selected.length)

            return res.json(selected)

        } catch(error) {
            
            return res.json({error: error, result: false})
        }
    }

// Viewed Hira
    else if(req.body.NbByCursorHira && onlyViewedHira === "true" && !isNaN(nbHira)&& NewBatchHira){
        try {

            // Chargé User et populate le progress dans User
            let user = await User.findById({_id: req.body.id})
            .populate("hiraganaProgress")


            // 
            let hiraAll = await Hiragana.find();
            let hiraProgList = user.hiraganaProgress;

            // fusion hiraAll et hiraProgress par un map
            let hiraAllWithProgress = hiraAll.map(hira => {
                // p = 1 hiraProgress de user
                let prog = hiraProgList.find(p => p.hiraganaId.toString() === hira._id.toString());
                return {
                    ...hira.toObject(),
                    progression: prog || null
                };
            })

// console.log("step3 good")
// console.log("progression", hiraAllWithProgress[0].progression.nbViews)

            let moy = hiraAllWithProgress.reduce((acc, value) => value.progression.nbViews + acc,0)/hiraAllWithProgress.length

            let filtered = hiraAllWithProgress.filter(e =>  { return e.progression.nbViews > 0})
            filtered && filtered.length > nbHira ? null : filtered = hiraAllWithProgress.filter(e =>  { return e.progression.nbViews >= moy})


// console.log(hiraAllWithProgress)
// console.log(moy)
// console.log("step4 good")
// console.log("filtered", filtered.length)


            //  
            let selected = [];

            for (let i = 0 ; i < nbHira; i++){

                if(filtered.length > 0){

                    const randomIndex = Math.floor(Math.random() * filtered.length);

                    selected.push(filtered[randomIndex])
                    filtered.splice(randomIndex, 1)
                } else {

                    const randomIndex = Math.floor(Math.random() * hiraAllWithProgress.length);

                    selected.push(hiraAllWithProgress[randomIndex])
                    hiraAllWithProgress.splice(randomIndex, 1)
                }
            }


// console.log("step5 good")
// console.log("selected", selected.length)

            return res.json(selected)

        } catch(error) {
            
            return res.json({error: error, result: false})
        }
    }
    
})

router.post("/Viewed&Unviewed", async (req, res) =>{

    // ajout token plus tard
    if (!checkBody(req.body, ["id", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    const nbKata = Number(req.body.NbByCursorKata)
    const nbHira = Number(req.body.NbByCursorHira)
    
    const NewBatchKata = req.body.needNewBatchKata
    const NewBatchHira = req.body.needNewBatchHira
    


    // Kata
    if (req.body.NbByCursorKata && !isNaN(nbKata) && NewBatchKata) {
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


        // Hira
    else if (req.body.NbByCursorHira && !isNaN(nbHira) && NewBatchHira) {
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






module.exports = router;