const mongoose = require('mongoose');

const katakanaProgressSchema = new mongoose.Schema({
    katakanaId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Katakanas'
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    name: String,
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