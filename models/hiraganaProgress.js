const mongoose = require('mongoose');

const hiraganaProgressSchema = new mongoose.Schema({
    hiraganaId: {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Hiraganas"
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users"
    },
    name : String,
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