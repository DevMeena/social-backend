const mongoose = require('mongoose');
const DB_URI =
  'mongodb+srv://anujk_45:2019ucp1418@cluster0.izl7iuj.mongodb.net/?retryWrites=true&w=majority';
const connectDB = async () => {
  try {
    // const connectionParams = {useNewUrlParser: true, useUnifiedTopology: true}
    await mongoose.connect(DB_URI);
    console.log('Database connected');
  } catch (e) {
    console.log(e);
  }
};

module.exports = connectDB;
