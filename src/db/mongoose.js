const mongoose = require('mongoose')

const connectDB = async () => {
  try {  
    // const connectionParams = {useNewUrlParser: true, useUnifiedTopology: true}
    await mongoose.connect(process.env.DB_URI);
    console.log('Database connected');
  } catch (e) {
    console.log(e); 
  } 
}   

module.exports = connectDB;