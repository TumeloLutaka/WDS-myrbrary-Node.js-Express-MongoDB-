const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('deleteOne', {document: true}, function(next) {
    Book.find({author: this.id})
    .then((books) => {
        if (books.length > 0){
            throw new Error('This author has books still')
        }
        
        next()
    })
    .catch(next)
})

module.exports = mongoose.model('Author', authorSchema)