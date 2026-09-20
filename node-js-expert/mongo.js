const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    isPublished: { type: Boolean, default: false },
});

mongoose.connect('mongodb://localhost:27017/post-app')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Connection error:', err));

module.exports = { postSchema, mongoose };
