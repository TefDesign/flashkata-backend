const mongoose = require('mongoose');

const katakanaProgressSchema = new mongoose.Schema({
    hiraganaId: String,
    userId: String,
    isValidated: Boolean,
    validatedAt: Date,
    responseTime: Number,
    nbViews: Number,
    nbCorrect: Number,
    nbWrong: Number,
});

const KatakanaProgress = mongoose.model('KatakanaProgress', katakanaProgressSchema);

module.exports = KatakanaProgress;