const mongoose = require('mongoose');

const katakanaProgressSchema = new mongoose.Schema({
    katakanaId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    isValidated: Boolean,
    validatedAt: Date,
    responseTime: Number,
    nbViews: Number,
    nbCorrect: Number,
    nbWrong: Number,
    isFavorite: Boolean,
});

const KatakanaProgress = mongoose.model('KatakanaProgress', katakanaProgressSchema);

module.exports = KatakanaProgress;