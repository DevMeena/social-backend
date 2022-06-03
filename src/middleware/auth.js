const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req, res, next) => {
  try{
    console.log('Inside auth')
    const token = req.header('Authorization').replace('Bearer ','')
    const decoded = jwt.verify(token,process.env.SECRET_STRING);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})

    if(!user){
      throw new Error()
    }

    req.token = token
    req.user = user
    next()
  } catch(e) {
    console.log(e);
    res.status(401).send({error: 'Please Authenticate'})
  }
}

module.exports = auth