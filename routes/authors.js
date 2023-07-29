const express =  require('express')
const router = express.Router()
const Author = require('../models/author.js')

// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name != ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    const authors = await Author.find(searchOptions)
    .then((authors) => {
        res.render('authors/index', {authors:authors, searchOptions: req.query })
    }) 
    .catch (() => {
        res.redirect('/')
    })

})

// New Authors Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author} )
})

// Create Author Route
router.post('/', (req, res) => {
    const author =  new Author({
        name: req.body.name
    })

    author.save()
    .then((newAuthor) => {
        // res.redirect(`authors/${newAuthor.id}`)
        res.redirect(`authors`)
    })
    .catch((err) => {
        res.render('authors/new', {author: author, errorMessage: 'Error creating author...'})
    })
})

module.exports = router