const express =  require('express')
const router = express.Router()
const Author = require('../models/author.js')
const Book = require('../models/book.js')

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
    res.render('authors/new', {author: new Author()} )
})

// Create Author Route
router.post('/', (req, res) => {
    const author =  new Author({
        name: req.body.name
    })

    author.save()
    .then((newAuthor) => {
        res.redirect(`authors/${newAuthor.id}`)
    })
    .catch((err) => {
        res.render('authors/new', {author: author, errorMessage: 'Error creating author...'})
    })
})

// Show Author
router.get('/:id', (req, res) => {
    Author.findById(req.params.id)
    .then((foundAuthor) => { Book.find({author:foundAuthor.id}).limit(6).exec()
        .then((foundBooks) => {
            res.render('authors/show', {author: foundAuthor, booksByAuthor: foundBooks})
        })
    })
    .catch(() => {
        res.redirect('/')
    })
})

// Edit Author
router.get('/:id/edit', (req, res) => {
    Author.findById(req.params.id)
    .then((author) => {
        res.render('authors/edit', {author: author} )
    })
    .catch(() => {
        res.redirect('/authors')
    })
})

// Update Author
router.put('/:id', (req, res) => {
    let author

    Author.findById(req.params.id)
    .then((foundAuthor) => {
        author = foundAuthor;
        foundAuthor.name = req.body.name
        foundAuthor.save()
        .then(() => res.redirect(`/authors/${author.id}`))
        .catch(() => res.redirect('/authors/edit',  {author: author, errorMessage: 'Error updating Author...'}))
    })
    .catch((err) => {
        res.render('/')
    })
})

// Delete author
router.delete('/:id', (req, res) => {
    let author

    Author.findById(req.params.id)
    .then((foundAuthor) => {
        author = foundAuthor;
        foundAuthor.deleteOne()
        .then(() => {
            res.redirect('/authors')
        })
        .catch((err) => {
            console.log(err)
            res.redirect(`/authors/${author.id}`)
        })
    })
    .catch((err) => {
        console.log(err)
        if(author == null){
            res.redirect('/')
        }
    })
})

module.exports = router