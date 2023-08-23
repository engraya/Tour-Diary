const express = require('express')
const router = express.Router();
const Book = require('../models/book')


router.get('/', async (request, response) => {
    let books
    try {
        books = await Book.find().sort({ createdAt : 'desc' }).limit(10).exec()
    } catch {
        books = []
        
    }
    const context = { books : books}
    response.render('index', context)
})



module.exports = router