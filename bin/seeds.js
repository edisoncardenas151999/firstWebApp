// bin/seeds.js

const mongoose = require('mongoose');
const Product = require('../models/products.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost/new-app';

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });


const products = [{
  name: 'Lonnie Baguette In Signature Jacquard',
  info:  "Signature jacquard and refined pebble leather, Inside multifunction pocket",
  price:140,
  img:"https://images.coach.com/is/image/Coach/c8306_svuq3_a0?$desktopProduct$"
}] 
Product.create(products)
  .then(productsFromDB => {
    console.log(`Created ${productsFromDB.length} products`);
    mongoose.connection.close();
  })
  .catch(err => console.log(`An error occurred while creating product from the DB: ${err}`));

