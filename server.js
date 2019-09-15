const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const db = require('./database')
//const mongoose = require('mongoose')
const { User, Exercise } = require('./models')

// Basic Configuration 
const port = process.env.PORT || 3000
const hostname = '127.0.0.1'

// INITIALIZE THE APP
const app = express()

// Serve static assets mounting the express.static() middleware
app.use('/public', express.static(__dirname + '/public'))

// Use Cross-origin resource sharing to allow AJAX requests to skip 
// the same-origin policy and access resources from remote hosts
app.use(cors())

// Mount the body parser middleware to extract the entire body portion 
// of an incoming request stream and expose it on req.body
// Support parsing of application/json type post data
app.use(bodyParser.json())

// Support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: false }))

// MIAN PAGE
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})
/*
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})*/

// API END POINTS
// New user
app.post('/api/exercise/new-user', function(req, res){
  const username = req.body.username
  User.exists({ username: username}, function(err, userExists){

    if(err) console.log(err)

    if(userExists) res.json({error: "Username already taken"})
    else {
      User.create({ username: username }, function(err, doc){
        err ? console.log(err) : res.json({ username: username, _id: doc._id})
      })      
    }
  })
})

// Array of users
app.get('/api/exercise/users', function(req, res){
  User.find({}, 'username _id', function(err, data){
    if(err) console.log(err)
    else res.json(data)
  })
})

// New exercise
app.post('/api/exercise/add', function(req, res){
  const userId = req.body.userId
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  User.exists({ username: userId }, function(err, userExists){
    if(err) console.log(err)

    // Check parameters
    if(!userExists) res.json({ error: "User doesn't exist"})    
    if(description === "") res.json({ error: "Must provide a description" })
    if(duration === "") res.json({ error: "Must provide a duration" })

    // Create document in MongoDB
    Exercise.create({
      username: userId,
      description: description,
      duration: duration,
      date: date === "" ? new Date() : new Date(date).toDateString()
    }, function(err, doc){
      if(err) console.log(err)
      else res.json({
        username: doc.username, 
        description: doc.description,
        duration: doc.duration,
        date: doc.date.toISOString().split('T')[0]
      })
    })
  })
})

// User's exercise log
app.get('/api/exercise/log?', function(req, res){
  // Query parameters
  const username = req.query.username
  let dateFrom = !req.query.from ? new Date(0,0,0) : new Date(req.query.from)
  let dateTo = !req.query.to ? new Date() : new Date(req.query.to)
  let limit = req.query.limit
  if(!limit) limit = 0
  // Query
  Exercise
    .find({
      username: username, 
      date: { $gte: dateFrom, $lte: dateTo }
    }, 'date description duration')
    .limit(parseInt(limit))
    .sort({ date: 1 })
    .exec(function(err, data){
      if(err) console.log(err)
      else res.json({
        username: username, 
        exercises: data.map(function(d){
          return {
            date: d.date.toISOString().split('T')[0],
            description: d.description,
            duration: d.duration
          } 
        })
      })
    })
})

app.listen(port, function () {
  //console.log(`Server running at http://${hostname}:${port}`)
})