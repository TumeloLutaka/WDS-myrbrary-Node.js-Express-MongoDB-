const express =  require('express')
const router = express.Router()
const Book = require('../models/book.js')

router.get('/', (req, res) => {
    let books = []

    Book.find().sort({createdAt: 'desc'}).limit(10).exec()
    .then((books) => {
        books = books;
        res.render('index', {books:books})
    })
    .catch(() => {
        books = []
        res.render('index', {books:books})
    })
})

module.exports = router