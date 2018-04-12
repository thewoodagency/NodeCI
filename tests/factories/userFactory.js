/**
 * Created by jay on 4/5/18
 */
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    return new User({}).save();
};