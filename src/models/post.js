const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    userId : {
      type: String, 
      required: true
    }, 
    desc : {
      type: String, 
      max: 500
    }, 
    img : {
      type: String
    }, 
    likes: {
      types : Array,
      default : []
    },
  },
  {timestamps: true}
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;