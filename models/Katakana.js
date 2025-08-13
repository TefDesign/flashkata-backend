const mongoose = require('mongoose');

const katakanaSchema = new mongoose.Schema({
    name: String,
    type : String,
    number : String
});

const Katakana = mongoose.model('Katakana', katakanaSchema);

module.exports = Katakana;