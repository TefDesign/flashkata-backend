var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/Users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
    try {
const data = await User.findOne({ userName: req.body.username });
    if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
    
        const newUser = await new User({
            userName: req.body.username,
            password: hash,
            token: uid2(32),
            avatar: req.body.avater,
            firstName: req.body.user,
            lastName: req.body.lastName,
            email: req.body.email, 
            hasTuto : req.body.hasTuto,
            hiraganaChallenge: {
                "1min": 0,
                "2min": 0,
                "3min": 0,
                "4min": 0,
                "5min": 0,
                "6min": 0,
                "7min": 0,
                "8min": 0,
                "9min": 0,
                "10min": 0
            },
            katakanaChallenge: {
                "1min": 0,
                "2min": 0,
                "3min": 0,
                "4min": 0,
                "5min": 0,
                "6min": 0,
                "7min": 0,
                "8min": 0,
                "9min": 0,
                "10min": 0
            },
            AllChallenge: {
                "1min": 0,
                "2min": 0,
                "3min": 0,
                "4min": 0,
                "5min": 0,
                "6min": 0,
                "7min": 0,
                "8min": 0,
                "9min": 0,
                "10min": 0
            }
            
    }).save()
    res.json({ 
        result: true,
        token: newUser.token,
        userName: newUser.userName,
    });
    } else {
        res.json({ result: false, error: "User already exists" });
    }
    } catch (error) {
        console.log(error);
    }
});




router.post("/signin", (req, res) => {
if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
}

User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({
        result: true,
        token: data.token,
        username: data.username,
        
    });
    } else {
        res.json({ result: false, error: "User not found or wrong password" });
    }
    });
});




module.exports = router;