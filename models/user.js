const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    surname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: { type: [], required: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;