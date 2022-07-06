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
      res.status(500).json(err);
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
      res.status(500).json(err);
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
        res.status(200).json('User has been followed');
      } else {
        res.status(403).json('You already follow this user');
      }
    } catch (err) {
      res.status(500).json(err);
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
        res.status(200).json('User has been unfollowed');
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
