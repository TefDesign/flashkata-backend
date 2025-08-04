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

        try {

            const user = await User.findOne({ email: req.body.email }).populate("hiraganaProgress");
            console.log(user)
            res.json(user)
            
        } catch (error){
            console.log(error)
        }


    
})




module.exports = router;