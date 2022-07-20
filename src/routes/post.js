const express = require('express');
const Post = require('../models/post');
const auth = require('../middleware/auth');
const cors = require('cors');
const router = new express.Router();
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const { photo } = require('../middleware/photo');

// ! CREATE A POST, TIMELINE, ROUTES ACCESSIBLE FROM FRONTEND

// const multer = require('multer');
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'src/public/images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });

// const upload = multer({ storage: storage });

// get post
router.get('/:id', cors(), auth, async (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.param('postId', (req, res, next, id) => {
  Post.findById(id).exec((err, post) => {
    if (err) {
      return res.status(400).json({
        error: 'Post not found',
      });
    }
    req.post = post;
    next();
  });
});

router.get('/photo/:postId', (req, res, next) => {
  if (req.post.photo.data) {
    res.set('Content-Type', req.post.photo.contentType);
    return res.send(req.post.photo.data);
  } else {
    return res.send(false);
  }
  next();
});

// Create Post
router.post('/', cors(), auth, (req, res) => {
  // auth
  // , auth
  console.log(req.body);
  console.log('hello');

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    if (fields.photo === 'null' && fields.desc === '') {
      console.log('fields are empty');
      return res.status(500).json({ error: 'cannot create empty post' });
    }

    // console.log(fields);

    const newPost = new Post(fields);
    console.log(file);
    console.log(fields.photo);
    if (fields?.photo !== 'null') {
      console.log('photo');
      if (file.photo) {
        if (file.photo.size > 5000000)
          return res.status(500).json({ error: 'file size too big' });
      }
      newPost.photo.data = fs.readFileSync(file.photo.filepath);
      newPost.photo.contentType = file.photo.type;
    }

    // console.log(newPost);

    newPost.save((err, post) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      console.log('post created successfully');
      res.status(200).json(post);
    });
  });
});

// Update Post
// router.put('/:id', cors(), auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (post.userId === req.body.userId) {
//       await post.updateOne({ $set: req.body });
//       res.status(200).json('The post has been updated');
//     } else {
//       res.status(403).json('You can update only your post');
//     }
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// !my update:

router.put('/:postId', cors(), auth, (req, res) => {
  let post = req.post;

  if (post.userId !== req.user._id.toString()) {
    console.log('cannot update others post');
    return res.status(500).json({ error: 'cannot update others post' });
  }

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    console.log(fields);
    console.log(post.desc);
    post = _.extend(post, fields);
    // const newPost = new Post(fields);

    if (file.photo) {
      if (file.photo.size > 5000000)
        return res.status(500).json({ error: 'file size too big' });

      // console.log(post);

      post.photo.data = fs.readFileSync(file.photo.filepath);
      post.photo.contentType = file.photo.type;
    }

    post.save((err, post) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      console.log('post updated successfully');
      res.status(200).json(post);
    });
  });
});

// Delete post
router.delete('/:postId', cors(), auth, async (req, res) => {
  // console.log(req.params.postId);
  // console.log(req.body);

  try {
    const post = await Post.findById(req.params.postId);
    console.log(post.desc);
    console.log(post.userId);
    console.log(req.user);
    console.log(post.userId === req.user._id.toString());
    if (post?.userId === req.user._id.toString()) {
      await post.deleteOne();
      return res.status(200).json({ message: 'The post has been deleted' });
    } else {
      console.log('You can delete only your post');
      return res.status(403).json({ error: 'You can delete only your post' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like/dislike post
router.put('/:id/like', cors(), auth, async (req, res) => {
  console.log('req.body is : ');
  console.log(req.body);

  try {
    const post = await Post.findById(req.params.id);
    // console.log(post.desc);
    console.log('likes array ', post.likes);
    console.log(post.likes.includes(req.body.userId));
    if (!post.likes.includes(req.body.userId)) {
      console.log('liking');
      await post.updateOne({ $push: { likes: req.body.userId } });
      console.log(post.likes);
      res.status(200).json('The post has been liked');
    } else {
      console.log('disliking');
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('The post has been disliked');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get user posts

router.get('/timeline/all/:userId', cors(), auth, async (req, res) => {
  try {
    // const currentUser = req.user;
    const userPosts = await Post.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get timeline posts

router.get('/timeline/all', cors(), auth, async (req, res) => {
  console.log(req.user);
  try {
    const currentUser = req.user;
    const userPosts = await Post.find({ userId: currentUser._id }).sort({
      createdAt: -1,
    });

    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId }).sort({
          createdAt: -1,
        });
      })
    );

    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

// upload post image
// router.post('/upload', cors(), upload.single('file'), (req, res) => {
//   try {
//     return res.status(200).json('File uploded successfully');
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(error);
//   }
// });

module.exports = router;
