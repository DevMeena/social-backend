require('dotenv').config()
const express = require('express')
const connectDB = require('./db/mongoose')
const cors = require('cors')
const userRouter = require('./routes/user');

const app = express()
const port = process.env.PORT || 8000

app.use(express.json());
// app.set("trust proxy", 1);
app.use(cors());
app.use(userRouter);

connectDB();

app.listen(port, () => {
  console.log('Server is up on port '+port)
})