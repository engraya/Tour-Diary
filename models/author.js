const mongooose = require('mongoose');

const authorSchema = mongooose.Schema({
    name: {
        type: String, 
        required: true
    }
})


const Author = mongooose.model('Author', authorSchema);


module.exports = Author;