const mongoose = require('mongoose');

const hiraganaProgressSchema = new mongoose.Schema({
    hiraganaId: {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Hiragana"
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    name : String,
    isValidated: Boolean,
    validatedAt: Date,
    responseTime: [Number],
    nbViews: Number,
    nbCorrect: Number,
    nbWrong: Number,
    isFavorite: Boolean,
    priority: Number
});

const HiraganaProgress = mongoose.model('HiraganaProgress', hiraganaProgressSchema);

module.exports = HiraganaProgress;