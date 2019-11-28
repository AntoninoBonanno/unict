const mongoose = require('mongoose');

// Inserito l'attributo favorites per tenere traccia dei tweet preferiti

const userSchema = mongoose.Schema({
    name: String,
    surname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: { type: Array, required: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;