require('./config/config');


const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//enable folder public
app.use(express.static(path.resolve(__dirname, '../public')));

console.log();

//routes
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;

    console.log("MongoDB online!");
});

app.listen(process.env.PORT, () => {
    console.log("Listening to the port", process.env.PORT);
})