const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    info:  String,
    price: { type: Number, required: true },
    img: String
}, 
{
  timestamps: true
})
const Product = mongoose.model("Product",  productSchema );


module.exports = Product;