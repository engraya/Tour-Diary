const express = require('express')
const router = express.Router()
const Author = require('../models/author');


// All Authors
router.get('/', async (request, response) => {
    let searchOptions = {}
    let queryNameString = request.query.name
    if (queryNameString != null && queryNameString !== '') {
        searchOptions.name = new RegExp(queryNameString, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        const context = { authors : authors, searchOptions : request.query }
        response.render('authors/index', context)
    } catch {
        response.redirect('/')
    }

})


// New Author Route
router.get('/new', (request, response) => {
    response.render('authors/new-author', { author : new Author() })
})



// Create Author Route
router.post('/', async (request, response) => {
    const author = new Author({
        name: request.body.name
    })

    try {
        //response.redirect(`authors/${newAuthor.id}`)
        const newAuthor = await author.save()
        response.redirect('authors')
    } catch {
        const context = { author : author, errorMessage : "Error Creating Author"}
        response.render('authors/new-author', context)
        
    }
})


module.exports = router