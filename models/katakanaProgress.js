const mongoose = require('mongoose');

const katakanaProgressSchema = new mongoose.Schema({
    katakanaId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Katakana'
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    isValidated: Boolean,
    validatedAt: Date,
    responseTime: [Number],
    nbViews: Number,
    nbCorrect: Number,
    nbWrong: Number,
    isFavorite: Boolean,
    priority: Number
});

const KatakanaProgress = mongoose.model('KatakanaProgress', katakanaProgressSchema);

module.exports = KatakanaProgress;