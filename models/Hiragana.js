const mongoose = require('mongoose');

const hiraganaSchema = new mongoose.Schema({
    name: String,
    image: String,
    placeholder: String,
    sound: String
});

const Hiragana = mongoose.model('Hiragana', hiraganaSchema);

module.exports = Hiragana;