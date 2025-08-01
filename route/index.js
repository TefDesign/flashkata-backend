const express = require('express');
const router = express.Router();
const Katakana = require('../models/Katakana');
const Hiragana = require('../models/Hiragana');


router.get('/', (req, res) => {
  res.send('kata!!!!');
});

router.get('/katakana', async(req, res) => {
  const resp = await Katakana({})
  res.json(resp)
})

router.get('/hiragana', async(req, res) => {
  const resp = await Hiragana({})
  res.json(resp)
})

router.post('/addKatakana', async(req, res) => {
  const resp = await new Katakana({
    name: req.body.name,
    image: req.body.image,
    placeholder: req.body.placeholder,
    sound: req.body.sound
  }).save()
  res.json({result : "katakana enregistré"})

});

router.post('/addHiragana', async(req, res) => {
  const resp = await new Hiragana({
    name: req.body.name,
    image: req.body.image,
    placeholder: req.body.placeholder,
    sound: req.body.sound
  }).save()
  res.json({result : "hiragana enregistré"})

});

module.exports = router;
