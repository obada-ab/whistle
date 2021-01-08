const router = require('express').Router();
const Card = require('../models/card-model');
const multer  = require('multer');
const path = require('path');
const ejs = require('ejs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.bmp') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true)
    }
});

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else {
        next();
    }
}

router.post('/new', upload.single('image'), authCheck, (req, res) => {
    card = new Card({
        author: req.user.id,
        content: req.body.content,
        likes: [],
        likeCount: 0
    });
    if (req.file) {
        card['imageFilename'] = req.file.filename;
    }
    card.save()
    .then((newCard) => res.json(newCard));
});

router.post('/like', authCheck, (req, res) => {
    Card.findById(req.body.card_id).populate('author').then(card => {
        if (card) {
            if (card.likes.some(el => el.discordID == req.user.discordID)) {
                card.likes = card.likes.filter(el => el.discordID !== req.user.discordID);
                card.likeCount--;
            } else {
                card.likes.push({discordID: req.user.discordID});
                card.likeCount++;
            }
            card.save();
        }
    })
    res.sendStatus(200);
});

router.post('/feed', authCheck, (req, res) => {
    function processCards(cards) {
        if (cards == undefined || cards.length == 0) {
            res.status(200).json({content: '', card: ''});
        } else {
            ejs.renderFile(__dirname + '/../views/partials/card.ejs', {user: req.user, cards: cards})
            .then(rendered => {
                res.status(200).json({content: rendered, card: cards[cards.length - 1]});
            });
        }
    }

    if (req.body.card && req.body.card != '') {
        Card.find({createdAt: {$lt: req.body.card.createdAt}})
        .sort({createdAt: -1})
        .limit(10)
        .populate('author')
        .then(cards => {
            processCards(cards);
        });
    } else {
        Card.find({}).sort({createdAt: -1}).limit(10).populate('author').then(cards => {
            processCards(cards);
        });
    }
});

router.post('/top', authCheck, async (req, res) => {
    async function processCards(cards) {
        if (cards == undefined || cards.length == 0) {
            return;
        } else {
            rndr = await ejs.renderFile(__dirname + '/../views/partials/card.ejs', {user: req.user, cards: cards});
            lastCard = cards[cards.length - 1];
            rendered += rndr;
        }
    }

    let counter = 0;
    let lastCard = null;
    let rendered = '';

    if (req.body.card && req.body.card != '') {
        const cards = await Card.find({
            likeCount: {$eq: req.body.card.likeCount},
            createdAt: {$lt: req.body.card.createdAt}
        })
        .sort({createdAt: -1})
        .limit(10)
        .populate('author').exec();
        counter += cards.length;
        await processCards(cards);
    } else {
        const cards = await Card.find({}).sort({likeCount: -1, createdAt: -1})
                            .limit(10).populate('author').exec();
        counter += cards.length;
        await processCards(cards);
    }

    if (counter < 10 && req.body.card && req.body.card != '') {
        const cards = await Card.find({
            likeCount: {$lt: req.body.card.likeCount}
        })
        .sort({likeCount: -1, createdAt: -1})
        .limit(10)
        .populate('author').exec();
        processCards(cards);
    }

    if (lastCard == null) {
        res.status(200).json({content: '', card: ''});
    } else {
        res.status(200).json({content: rendered, card: lastCard});
    }
});

router.post('/profile', authCheck, (req, res) => {
    function processCards(cards) {
        if (cards == undefined || cards.length == 0) {
            res.status(200).json({content: '', card: ''});
        } else {
            ejs.renderFile(__dirname + '/../views/partials/card.ejs', {user: req.user, cards: cards})
            .then(rendered => {
                res.status(200).json({content: rendered, card: cards[cards.length - 1]});
            });
        }
    }

    if (req.body.card && req.body.card != '') {
        Card.find({author: req.user.id, createdAt: {$lt: req.body.card.createdAt}})
        .sort({createdAt: -1})
        .limit(10)
        .populate('author')
        .then(cards => {
            processCards(cards);
        });
    } else {
        Card.find({author: req.user.id}).sort({createdAt: -1})
        .limit(10).populate('author').then(cards => {
            processCards(cards);
        });
    }
});

module.exports = router;