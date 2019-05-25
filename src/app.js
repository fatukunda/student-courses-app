const express = require('express')
const studentRouter = require('./routers/student')
const courseRouter = require('./routers/course')
require('./db/db')

const app = express()

app.use(express.json())
app.use(studentRouter)
app.use(courseRouter)

module.exports = app