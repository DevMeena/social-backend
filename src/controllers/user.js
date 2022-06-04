const User = require('../models/user');
const {OAuth2Client} = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client("644150943784-dd4aaim7fuvgemorumocbbcgb4rmvdel.apps.googleusercontent.com");

exports.signup = async (req, res) => {
  try {
    console.log('Inside signup');
    console.log(req.body);
    const user = new User(req.body);
    await user.save((err, data) => {
      if(err){
        return res.status(400).send('Signup failed');
      }

      console.log('signup successful');
      const {_id, email, name} = data;
      res.json({user: {_id, name, email}});
    });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
}

exports.login = async (req, res) => {
  try {
    console.log('Inside Login');
    console.log(req.body.email);
    console.log(req.body.password);

    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    console.log('found');
    const token = await user.generateAuthToken();
    const {_id, name, email} = user;
    res.json({ user: {_id, name, email}, token });
  } catch (e) {
    console.log('something went wrong');
    console.log(e);
    res.status(400).send(e);
  }
}

// exports.logout = async (req, res) => {
//   try {
//     console.log('Inside Logout');
//     req.user.tokens = req.user.tokens.filter((token) => {
//       return token.token !== req.token;
//     });
//     await req.user.save();

//     res.send('Successfully logged out');
//   } catch (e) {
//     res.status(500).send();
//   }
// }

exports.googleLogin = async(req, res) => {
  try {
    console.log('Inside google Login');
    const {tokenId} = req.body;
    
    client.verifyIdToken({idToken: tokenId, audience: "644150943784-dd4aaim7fuvgemorumocbbcgb4rmvdel.apps.googleusercontent.com"}).then((response) => {
      // console.log(response.payload);
      const {email_verified, name, email} = response.payload;

      if(email_verified) {
        console.log('email is verified');
        User.findOne({email}).exec((err, user) => {
          if(err) {
            console.log(e);
            return res.status(400).json({
              error: "Something went wrong..."
            })
          }else {
            if(user) {
              console.log('User found');
              const token = user.generateAuthToken();
              const {_id, name, email} = user;

              res.json({
                token, 
                user: {_id, name, email}
              })
            } else {
              console.log('Creating user');
              let password = email+'helloworld';
              const newUser = new User({name, email, password});
              newUser.save((err, data) => {
                if(err) {
                  console.log('Error in creating user', err);
                  return res.status(400).json({
                    error: "Something went wrong..."
                  })
                }

                const token = jwt.sign({_id: data._id}, 'helloworld', {expiresIn: '7d'});
                const {_id, name, email} = newUser;
                console.log('User created successfully');
                res.json({
                  token, 
                  user: {_id, name, email}
                })

              });
            }
          }
        })
      }else {
        console.log('Email is not verified');
      }
    })
  } catch (e) {
    console.log(e);
    res.status(400).send('Something went wrong...')
  }
}

exports.authCheck = async(req, res) => {
  try {
    const SECRET_STRING = 'helloworld';
    console.log('Inside auth');
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET_STRING);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    const {_id, name, email} = user;
    res.json({
      token,
      user: {_id, name, email}
    })
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: 'Please Authenticate' });
  }

}