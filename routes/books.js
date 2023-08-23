const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const path = require('path');
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require('../models/author');
const multer = require('multer');
const fs = require('fs')

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
const upload = multer({
    dest: uploadPath, 
    fileFilter: (request, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})



// All Books
router.get('/', async (request, response) => {
    let query = Book.find()
    if (request.query.title != null && request.query.title != '' ) {
        query = query.regex('title', new RegExp(request.query.title, 'i'))
    } 
    if (request.query.publishedBefore != null && request.query.publishedBefore != '' ) {
        query = query.lte('publishDate', request.query.publishedBefore)
    } 
    if (request.query.publishedAfter != null && request.query.publishedAfter != '' ) {
        query = query.gte('publishDate', request.query.publishedAfter)
    } 
    try {
        const books = await query.exec()
        const context = { books : books, searchOptions : request.query}
        response.render('books/index', context)
    } catch {
        response.redirect('/')
    }
})


// New Book Route
router.get('/new', async (request, response) => {
    renderNewPage(response, new Book())

})



// Create Book Route
router.post('/', upload.single('cover'),  async (request, response) => {
    const filename = request.file != null ? request.file.filename : null
    const book = new Book({
        title: request.body.title,
        author: request.body.author,
        publishDate : request.body.publishDate,
        pageCount : request.body.pageCount,
        description : request.body.description,
        coverImageName : filename
    })

    try {
        const newBook = await book.save()
        //response.redirect(`books/${newBook.id}`)
        response.redirect('books')
    } catch {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(response, book, true)
    }
})


function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), error => {
        if (error) console.error(error)
    })
}


async function renderNewPage(response, book, haserror = false) {
    try {
        const authors = await Author.find({})
        const book = new Book()
        context = { authors : authors, book : book}
        if(haserror) context.errorMessage = 'Error Creating Book'
        response.render('books/new-book', context)
    } catch {
        response.redirect('books')
    }
 

}


module.exports = router