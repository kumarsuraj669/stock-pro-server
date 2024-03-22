require('dotenv').config()
const {connectToMongo} = require("./db");
const express = require('express')
var cors = require('cors')
const port = process.env.PORT || 7000

connectToMongo();

const app = express()
// var corsOptions = {
//   origin: "http://localhost:3000"
// };

app.use(cors(corsOptions));

app.get('/', (req, res)=>{
  res.send("<h1>Hello</h1>")
})

app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/items', require('./routes/items'))
app.use('/api/history', require('./routes/history'))
app.use('/api/statement', require('./routes/statement'))

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
