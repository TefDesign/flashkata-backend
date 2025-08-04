const mongoose = require('mongoose');

const hiraganaProgressSchema = new mongoose.Schema({
    hiraganaId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    isValidated: Boolean,
    validatedAt: Date,
    responseTime: Number,
    nbViews: Number,
    nbCorrect: Number,
    nbWrong: Number,
    isFavorite: Boolean,
});

const HiraganaProgress = mongoose.model('HiraganaProgress', hiraganaProgressSchema);

module.exports = HiraganaProgress;