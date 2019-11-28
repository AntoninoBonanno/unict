const mongoose = require('mongoose');

// Inseriti gli attributi:
// - _parent: contiene l'id del tweet principale;
// - isFavorite: posto a true se il tweet è preferito dall'utente corrente
// - like: array degli id degli utenti

const tweetSchema = mongoose.Schema({
    _author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User'
    },
    tweet: {
        type: String,
        minlenght: 1,
        maxlenght: 280,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    _parent: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null
    },
    isFavorite: {
        type: mongoose.Schema.Types.Boolean,
        require: false,
        default: true
    },
    like: {
        type: [mongoose.Schema.Types.ObjectId],
        defualt: null,
        ref: 'User'
    }
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;