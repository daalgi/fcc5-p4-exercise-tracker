const mongoose = require('mongoose')

// Create User
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true }
})

const User = mongoose.model('User', userSchema)


// Create Exercise
const exerciseSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: new Date() }
})

const Exercise = mongoose.model('Exercise', exerciseSchema)


// Export the models
module.exports = { User, Exercise }