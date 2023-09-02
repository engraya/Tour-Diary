const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const fs = require('fs');
const multer  = require('multer');


const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


//image uploads
var storage = multer.diskStorage({
    destination : function(request, file, callback) {
        callback(null, "./uploads/")
    },
    filename : function(request, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
})

var upload = multer({
    storage : storage,
}).single('image')



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
router.post('/', upload,  async (request, response) => {
    // const filename = request.file != null ? request.file.filename : null
    const book = new Book({
        title: request.body.title,
        author: request.body.author,
        publishDate : request.body.publishDate,
        pageCount : request.body.pageCount,
        description : request.body.description,
        image : request.file.filename,
     
    })


    try {
        const newBook = await book.save()
        //response.redirect(`books/${newBook.id}`)
        response.redirect('books')
    } catch {
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName)
        // }
        renderNewPage(response, book, true)
    }
})


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


router.get('/update/:id', (request, response) => {
    let id = request.params.id;
    const book = Book.findById(id)
            .then((farmer) =>{
                context = { book : book, title : 'Update Book'}
                response.render("editbook", context)
            })
            .catch((error) => {
                response.redirect("books")
            })
})

router.post('/update/:id', upload, (request, response) => {
    let id = request.params.id;
    let new_image = ""

    if (request.file) {
        new_image = request.file.filename;
        try {
            fs.unlinkSync("./uploads" + request.body.old_image)
            
        } catch (error) {
            console.log(error)
        }
    } else {
        new_image = request.body.old_image
    }

    Book.findByIdAndUpdate(id, {
        title: request.body.title,
        author: request.body.author,
        publishDate : request.body.publishDate,
        pageCount : request.body.pageCount,
        description : request.body.description,
        image : new_image
    })
    .then(book => {
        request.session.message = {
            type : 'success',
            message : 'Book Updated Successfully...!'
        };
        response.redirect('books')
    })
    .catch((error) => console.log(error))

})



router.get('/delete/:id', (request, response) => {
    let id = request.params.id;
    Book.findOneAndRemove(id)
        .then((result) => {
            if (result.image != '') {
                try {
                    fs.unlinkSync('./uploads/' + result.image)
                } catch (error) {
                    console.log(error)
                }
            }
            request.session.message = {
                type : 'success',
                message : 'Book Deleted Successfully...!'
            };
            response.redirect('books')
        })
        .catch((error) => {
            console.log(error)
        })
})




// function saveCover(book, coverEncoded) {
//     if (coverEncoded == null) return
//     const cover = JSON.parse(coverEncoded)
//     if (cover != null && imageMimeTypes.includes(cover.type)) {
//       book.coverImage = new Buffer.from(cover.data, 'base64')
//       book.coverImageType = cover.type
//     }
//   }

module.exports = router