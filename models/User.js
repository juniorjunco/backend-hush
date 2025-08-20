const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: String,
  lastName: String,
  document: String,
  gender: String,
  birthdate: Date, // antes era String
  phone: {
    type: String,
    match: /^[0-9\-\+]{9,15}$/
  },

  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
});

module.exports = mongoose.model('User', userSchema);
