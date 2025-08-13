const mongoose = require('mongoose');

const hiraganaSchema = new mongoose.Schema({
    name: String,
    type : String,
    number : String
});

const Hiragana = mongoose.model('Hiragana', hiraganaSchema);

module.exports = Hiragana;