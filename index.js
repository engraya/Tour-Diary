// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').parse()
// }

const express = require('express')
const expressEjsLayouts = require('express-ejs-layouts')
const app = express()
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');





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
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(bodyParser.urlencoded({ extended : false, limit : '10mb' }));
app.use(methodOverride('_method'));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Connect flash
  app.use(flash());


// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });


app.use((request, response, next) => {
  response.locals.message = request.session.message;
  delete request.session.message;
  next();
})


app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

app.listen(process.env.PORT || 5000)