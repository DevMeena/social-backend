const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const cors = require('cors');

// update user/ Not password
router.put('/:id', cors(), auth, async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json('Account has been successfully updated');
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json('You can only update your account');
  }
});

// Update Password
router.put('/updatePassword/:id', cors(), auth, async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    try {
      const user = req.user;
      user.password = req.body.password;
      await user.save();
      return res.status(200).json('Password Updated Successfully');
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json('You can only update your password');
  }
});

// Delete User
router.delete('/:id', cors(), auth, async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json('Account has been successfully deleted');
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json('You can only delete your account');
  }
});

// get a user
router.get('/:id', cors(), auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json("Can't find user");
  }
});

// follow a user
router.put('/:id/follow', cors(), auth, async (req, res) => {
  console.log(req.params.id !== req.user._id.toString());

  if (req.user._id.toString() !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = req.user;

      if (!user.followers.includes(req.user._id.toString())) {
        await user.updateOne({ $push: { followers: req.user._id.toString() } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        console.log('User has been followed', user.name, currentUser.name);
        res.status(200).json('User has been followed');
      } else {
        res.status(403).json('You already follow this user');
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

// unfollow a user
router.put('/:id/unfollow', cors(), auth, async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = req.user;

      if (user.followers.includes(req.user._id.toString())) {
        await user.updateOne({ $pull: { followers: req.user._id.toString() } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        console.log('User has been Unfollowed', user.name, currentUser.name);
        res.status(200).json('User has been unfollowed');
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

// get followers
router.get('/followers/:id', cors(), auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const followers = [];
    await Promise.all(
      user.followers.map(async (id) => {
        const follower = await User.findById(id);
        const { _id, name, profilePicture } = follower;
        followers.push({ _id, name, profilePicture });
      })
    );

    console.log('Followers list', followers);
    res.status(200).send(followers);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get followings
router.get('/followings/:id', cors(), auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    let followings = [];
    await Promise.all(
      user.followings.map(async (id) => {
        const following = await User.findById(id);
        const { _id, name, profilePicture } = following;
        followings.push({ _id, name, profilePicture });
      })
    );
    console.log('Followings list', followings);
    res.status(200).send(followings);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/search/:key', cors(), auth, async (req, res) => {
  try {
    const regex = new RegExp(req.params.key, 'i');
    console.log(regex);
    const data = await User.find({
      $or: [{ name: regex }, { email: regex }],
    });

    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
