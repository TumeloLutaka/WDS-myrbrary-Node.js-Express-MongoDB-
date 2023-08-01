

const express =  require('express')
const router = express.Router()
const path = require('path')

const Book = require('../models/book.js')
const Author = require('../models/author.js')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

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
router.post('/', (req, res) => {
   const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)

    book.save()
    .then((newBook) => {
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    })
    .catch (() => {
        renderNewPage(res, book, true)
    })
})

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

function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type))
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType= cover.type
}

module.exports = router