var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  try {
    // Check if the user has not already been registered
    const data = await User.findOne({ username: req.body.username });

    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then((newDoc) => {
        res.json({ 
          result: true,
          token: newDoc.token,
          username: newDoc.username,

        });
      });
    } else {
      // User already exists in database
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

router.get("/bestScoreUser", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    res.json({ result: false, error: "Missing username" });
    return;
  }
  const user = await User.findOne({ username });
  if (user) {
    res.json({ result: true, bestScoreUser: user.bestScore });
  } else {
    res.json({ result: false, bestScoreUser: 0 });
  }
});

router.patch("/bestScoreUser", async (req, res) => {
  const { username, score } = req.body;
  if (!username || typeof score !== "number") {
    return res.json({ result: false, error: "Missing data" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.json({ result: false, error: "User not found" });
  }

  if (score > (user.bestScore ?? 0)) {
    user.bestScore = score;
    await user.save();
  }

  res.json({ result: true, bestScoreUser: user.bestScore });
});




module.exports = router;