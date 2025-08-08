const express = require("express");
const router = express.Router();
const Katakana = require("../models/Katakana");
const Hiragana = require("../models/Hiragana");
const uid2 = require("uid2");

router.post("/kataGen", async (req, res) => {
  for (let i = 0; i < 100; i++) {
    const kata = await new Katakana({
      name: uid2(10),
      image: "req.body.image",
      placeholder: "req.body.placeholder",
      sound: "req.body.sound",
    }).save();
    const hira = await new Hiragana({
      name: uid2(10),
      image: "req.body.image",
      placeholder: "req.body.placeholder",
      sound: "req.body.sound",
    }).save();
  }
  res.json({ result: true });
});

router.get("/", (req, res) => {
  res.json("kata!!!!");
});

router.get("/katakana", async (req, res) => {
  const resp = await Katakana.find({});
  res.json(resp);
});

router.get("/hiragana", async (req, res) => {
  const resp = await Hiragana.find({});
  res.json(resp);
});

router.post("/addKatakana", async (req, res) => {
  const resp = await new Katakana({
    name: req.body.name,
    image: req.body.image,
    placeholder: req.body.placeholder,
    sound: req.body.sound,
  }).save();
  res.json({ result: "katakana enregistré" });
});

router.post("/addHiragana", async (req, res) => {
  const resp = await new Hiragana({
    name: req.body.name,
    image: req.body.image,
    placeholder: req.body.placeholder,
    sound: req.body.sound,
  }).save();
  res.json({ result: "hiragana enregistré" });
});

module.exports = router;
