const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 20
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"');
      }
    },
  }, 
  profilePicture: {
    type: String,
    default: "",
  }, 
  coverPicture: {
    type: String, 
    default: "",
  },
  followers: {
    type: Array,
    default: [],
  }, 
  following: {
    type: Array,
    default: [],
  }, 
  isAdmin : {
    type: Boolean, 
    default: false,
  },
  desc: {
    type: String, 
    max: 50,
  },
  city: {
    type: String, 
    max: 50,
  }, 
  form: {
    type: String,
    max: 50,
  }, 
  relationship: {
    type: Number,
    enum: [1,2,3]
  }
},
{timestamps: true}
);

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const SECRET_STRING = 'helloworld';

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, SECRET_STRING, {expiresIn: '7d'});

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
