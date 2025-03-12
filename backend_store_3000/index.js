const express = require('express');
const fs = require('fs');
const path = require('path');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();
const PORT = 3000;

// Middleware для статических файлов
app.use(express.static(path.join(__dirname)));

// 1. Определяем GraphQL схему
const typeDefs = gql`
  type Product {
    title: String
    price: Float
    description: String
    imageUrl: String
    category: [String]
  }

  type Query {
    products: [Product]
  }
`;

// 2.  Определяем резолверы (как получать данные)
const resolvers = {
  Query: {
    products: async () => {
      try {
        const productsJson = await fs.promises.readFile(path.join(__dirname, 'products.json'), 'utf8');
        return JSON.parse(productsJson);
      } catch (err) {
        console.error('Error reading products.json:', err);
        return [];
      }
    },
  },
};

// 3. Создаем экземпляр Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Асинхронная функция для запуска Apollo Server и Express
async function startApolloServer() {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    // Оставляем ваш существующий код для /mainmarket
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
              <img src="${product.imageUrl}" alt="${product.title}" width="150">
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

    // Запускаем Express-сервер
    app.listen(PORT, () => {
      console.log(`Store server running on http://localhost:${PORT}`);
      console.log(`GraphQL API ready at http://localhost:${PORT}/graphql`);
    });
}

// Запускаем сервер
startApolloServer();