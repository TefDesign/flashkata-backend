const mongoose = require('mongoose');

const katakanaSchema = new mongoose.Schema({
    name: String,
});

const Katakana = mongoose.model('Katakana', katakanaSchema);

module.exports = Katakana;