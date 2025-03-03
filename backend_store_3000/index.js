const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
console.log("1")
app.use(express.static(path.join(__dirname)));
console.log("2")
app.get('/mainmarket', (req, res) => {
    console.log('Reading index.html');
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error loading index.html');
    }

    fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, productsJson) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error loading products.json');
      }

      const products = JSON.parse(productsJson);

      const productCards = products.map(product => `
        <div class="product-card">
          <img src="" alt="${product.title}" width="150">
          <h3>${product.title}</h3>
          <p>Price: $${product.price}</p>
          <p>${product.description}</p>
          <p>Category: ${Array.isArray(product.category) ? product.category.join(', ') : product.category}</p>
        </div>
      `).join('');

      const updatedHtml = html.replace('<!-- PRODUCTS_HERE -->', productCards);
      res.send(updatedHtml);
    });
  });
});
console.log("3")
app.listen(PORT, () => {
  console.log(`Store server running on http://localhost:${PORT}`);
});