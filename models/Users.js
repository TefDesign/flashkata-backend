const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    avatar: String,
    userName: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,   
    token: String,
    hasTuto : Boolean,
    hiraganaProgress: [mongoose.Schema.Types.ObjectId],
    katakanaProgress: [mongoose.Schema.Types.ObjectId],
    hiraganaChallenge: {
        "1min": Number,
        "2min": Number,
        "3min": Number,
        "4min": Number,
        "5min": Number,
        "6min": Number,
        "7min": Number,
        "8min": Number,
        "9min": Number,
        "10min": Number
    },
    katakanaChallenge: {
        "1min": Number,
        "2min": Number,
        "3min": Number,
        "4min": Number,
        "5min": Number,
        "6min": Number,
        "7min": Number,
        "8min": Number,
        "9min": Number,
        "10min": Number
    },
    AllChallenge: {
        "1min": Number,
        "2min": Number,
        "3min": Number,
        "4min": Number,
        "5min": Number,
        "6min": Number,
        "7min": Number,
        "8min": Number,
        "9min": Number,
        "10min": Number
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;