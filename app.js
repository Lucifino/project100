const express = require('express');
const mongoose = require('mongoose');
const env = require('dotenv').config();
const {server_settings, API_STRING} = require('./server.config');

const port = process.env.PORT || 5001;
const url = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const host = process.env.DB_HOST || 'localhost'
const database = process.env.DATABASE;
const routers = require('./src/routers');

const cors = require('cors');

const app = express();
app.use(cors());

app.use(API_STRING, routers);

mongoose.connect(`${url}${database}`, server_settings)
.then(() => {
  app.listen(port, (err) => {
    if(err) throw err;
    else{
      console.log(`=======================================`)
      console.log(`Landed on Landi-ng!`);
      console.log(`🐍 Flirting started @ port: ${host}:${port}`) 
      console.log(`=======================================`)
    }
  })
})