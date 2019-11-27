const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const Tweet = require('../models/tweet');
const User = require('../models/user');
const autenticationMiddleware = require('../middlewares/auth');
const { checkValidation } = require('../middlewares/validation');


router.get('/', autenticationMiddleware.isAuth, function (req, res, next) {
  Tweet.find({ _parent: null }).populate("_author", "-password").exec(function (err, tweets) {
    if (err) return res.status(500).json({ error: err });

    if (!res.locals.authInfo || !res.locals.authInfo.userId) {
      res.json(tweets);
    }
    else {
      User.findOne({ _id: res.locals.authInfo.userId }, "-password", function (err, user) {
        if (err) return res.status(500).json({ error: err });
        var favorites = new Set(user.favorites);
        tweets.forEach(tweet => {
          if (favorites.has(tweet.id)) {
            tweet.isFavorite = true;
          }
          else {
            tweet.isFavorite = false;
          }
        });
        res.json(tweets);
      });
    }
  });
});

router.get('/:id', autenticationMiddleware.isAuth, function (req, res, next) {
  Tweet.findOne({ _id: req.params.id })
    .populate("_author", "-password")
    .exec(function (err, tweet) {
      if (err) return res.status(500).json({ error: err });
      if (!tweet) return res.status(404).json({ message: 'Tweet not found' })
      res.json(tweet);
    });
});

router.get('/:id/comments', autenticationMiddleware.isAuth, function (req, res, next) {
  Tweet.find({ _parent: req.params.id })
    .populate("_author", "-password")
    .exec(function (err, comments_tweet) {
      if (err) return res.status(500).json({ error: err });
      res.json(comments_tweet);
    });
});

router.post('/', autenticationMiddleware.isAuth, [
  check('tweet').isString().isLength({ min: 1, max: 120 })
], checkValidation, function (req, res, next) {
  const newTweet = new Tweet(req.body);
  newTweet._author = res.locals.authInfo.userId;

  if (newTweet._parent != null) {
    if (Tweet.findOne({ _id: newTweet._parent }) == null) {
      return res.status(500).json({ err: "Il tweet non esiste" });
    }
  }

  newTweet.save(function (err) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.status(201).json(newTweet);
  });
});

router.put('/:id', autenticationMiddleware.isAuth, [
  check('tweet').isString().isLength({ min: 1, max: 120 })
], checkValidation, function (req, res, next) {
  Tweet.findOne({ _id: req.params.id }).exec(function (err, tweet) {
    if (err) {
      return res.status(500).json({
        error: err,
        message: "Error reading the tweet"
      });
    }
    if (!tweet) {
      return res.status(404).json({
        message: "Tweet not found"
      })
    }
    if (tweet._author.toString() !== res.locals.authInfo.userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "You are not the owner of the resource"
      });
    }
    tweet.tweet = req.body.tweet;
    tweet.save(function (err) {
      if (err) return res.status(500).json({ error: err });
      res.json(tweet);
    });
  });
});

router.delete('/:id', autenticationMiddleware.isAuth, function (req, res, next) {
  Tweet.findOne({ _id: req.params.id }).exec(function (err, tweet) {
    if (err) {
      return res.status(500).json({
        error: err,
        message: "Error reading the tweet"
      });
    }
    if (!tweet) {
      return res.status(404).json({
        message: "Tweet not found"
      })
    }
    if (tweet._author.toString() !== res.locals.authInfo.userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "You are not the owner of the resource"
      });
    }

    Tweet.remove({ _id: req.params.id }, function (err) {
      if (err) {
        return res.status(500).json({ error: err })
      }
      res.json({ message: 'Tweet successfully deleted' })
    });
  });

  if (tweet._parent == null) {
    Tweet.remove({ _parent: tweet._id }, function (err) {
      if (err) {
        res.status(500).json({ error: err })
      }
    });
  }
});

module.exports = router;