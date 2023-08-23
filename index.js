// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').parse()
// }

const express = require('express')
const expressEjsLayouts = require('express-ejs-layouts')
const app = express()
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');


const dbURL = 'mongodb://localhost:27017/myTechBooksDB'

mongoose.connect(dbURL, { family : 4}, { useNewUrlParser: true, useUnifiedTopology: true  } )
    .then(() => console.log('Successfully Connected to Database...'))
    .catch((err) => console.log(err));

// const db = mongoose.connection
// db.on('error', error => console.log(error))
// db.once('open', () => console.log('Successfully Connected to Database...'))



app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressEjsLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended : false, limit : '10mb' }))



app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

app.listen(process.env.PORT || 5000)