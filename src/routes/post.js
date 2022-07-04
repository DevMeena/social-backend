const express = require('express');
const Post = require('../models/post');
const auth = require('../middleware/auth');
const cors = require('cors');

const router = new express.Router();
// Create Post
router.post('/', cors(), auth, async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update Post
router.put('/:id', cors(), auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json('The post has been updated');
    } else {
      res.status(403).json('You can update only your post');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete post
router.delete('/:id', cors(), auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('The post has been deleted');
    } else {
      res.status(403).json('You can delete only your post');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like/dislike post
router.put('/:id/like', cors(), auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.include(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('The post has been liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('The post has been disliked');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get post
router.get('/:id', cors(), auth, async (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get timeline posts
router.get('/timeline/all', cors(), auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const userPosts = await Post.find({ userId: currentUser._id });
    console.log('inside timeline : ', userPosts);
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
