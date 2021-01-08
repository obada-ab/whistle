const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'user' },
    content: String,
    likes: [{
        discordID: String
    }],
    likeCount: Number,
    imageFilename: String,
    date: Date
}, {timestamps: true});

cardSchema.index({likeCount: -1, createdAt: -1});
cardSchema.index({createdAt: -1});
cardSchema.index({id: -1, createdAt: -1});
const Card = mongoose.model('card', cardSchema);

module.exports = Card;