const express =  require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book.js')
const uploadPath = path.join('public', Book.converImageBasePath)
const Author = require('../models/author.js')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore!= ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter!= ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    query.exec()
    .then((books) => {



        res.render('books/index', {books:books, searchOptions: req.query})
    })
})

// New Books Route
router.get('/new', (req, res) => {
    renderNewPage(res, new Book())
})

// Create Books Route
router.post('/', upload.single('cover'), (req, res) => {
    const fileName = req.file != null ?req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    })

    book.save()
    .then((newBook) => {
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    })
    .catch (() => {
        if(book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }

        renderNewPage(res, book, true)
    })
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

function renderNewPage(res, book, hasError = false) {
    Author.find()
    .then((authors) => {
        const book = new Book()

        const params = {authors:authors, book:book}
        if(hasError) {params.errorMessage = 'Error creating book'}

        res.render('books/new', params)
        
    }) 
    .catch (() => {
        res.redirect('/books')
    })
}

module.exports = router