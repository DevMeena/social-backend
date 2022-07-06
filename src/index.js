require('dotenv').config();
const express = require('express');
const connectDB = require('./db/mongoose');
const cors = require('cors');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const multer = require('multer');
const path = require('path');
// const upload = require('./routes/upload');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

const bodyparser = require('body-parser');

// let gfs;

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json());

// app.set("trust proxy", 1);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/post', postRouter);

connectDB();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    return res.status(200).json('File uploded successfully');
  } catch (error) {
    console.error(error);
  }
});

// const conn = mongoose.connection;
// conn.once('open', function () {
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection('photos');
// });

// app.use('/file', upload);

// app.get('/file/:filename', async (req, res) => {
//   try {
//     const file = await gfs.files.findOne({ filename: req.params.filename });
//     const readStream = gfs.createReadStream(file.filename);
//     readStream.pipe(res);
//   } catch (error) {
//     res.send('not found');
//   }
// });

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
