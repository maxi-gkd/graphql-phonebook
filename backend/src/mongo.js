const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config();

const mongoUrl = process.env.MONGODB_URI
console.log('Connecting to MongoDB')

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.log('Error connection to MongoDB:', error.message)
    })
