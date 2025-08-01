const mongoose = require('mongoose');

const katakanaSchema = new mongoose.Schema({
    name: String,
    image: String,
    placeholder: String,
    sound: String
});

const Katakana = mongoose.model('Katakana', katakanaSchema);

module.exports = Katakana;