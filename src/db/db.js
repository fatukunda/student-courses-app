const mongoose = require('mongoose')

mongoose.connect(process.env.API_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
})