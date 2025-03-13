const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

// Path to the shared products.json file
const productsFilePath = path.join(__dirname, '../backend_store_3000/products.json');

// Function to read products from file
function readProducts() {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading products.json:", err);
        return [];
    }
}

// Function to write products to file
function writeProducts(products) {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (err) {
        console.error("Error writing to products.json:", err);
    }
}

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Admin API',
            version: '1.0.0',
            description: 'API for managing products',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: [__filename], // This line tells swagger-jsdoc to use jsdoc comments in this file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     description: Retrieve all products from the store.
 *     responses:
 *       200:
 *         description: A list of products.
 */
app.get('/products', (req, res) => {
    const products = readProducts();
    res.json(products);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product or a list of products
 *     description: Adds a new product or a list of products to the store.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: The title of the product.
 *                 price:
 *                   type: number
 *                   description: The price of the product.
 *     responses:
 *       201:
 *         description: Product(s) successfully added.
 *       400:
 *         description: Invalid input.
 */
app.post('/products', (req, res) => {
    const newProducts = Array.isArray(req.body) ? req.body : [req.body];
    let products = readProducts();

    newProducts.forEach(newProduct => {
        newProduct.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1; // Generate unique ID
        products.push(newProduct);
    });

    writeProducts(products);
    res.status(201).json({ message: 'Product(s) added successfully' });
});


/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a single product by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested product.
 *       404:
 *         description: Product not found.
 */
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = readProducts();
    const product = products.find(p => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Retrieve products by category
 *     description: Get all products that belong to a specified category.
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: The category of products to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of products in the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the product.
 *                   title:
 *                     type: string
 *                     description: The title of the product.
 *                   price:
 *                     type: number
 *                     description: The price of the product.
 *                   category:
 *                     type: string
 *                     description: The category of the product.
 *       404:
 *         description: No products found in this category.
 */
app.get('/products/category/:category', (req, res) => {
    const category = req.params.category;
    const products = readProducts();
    
    const filteredProducts = products.filter(p => p.category === category);

    if (filteredProducts.length > 0) {
        res.json(filteredProducts);
    } else {
        res.status(404).json({ message: 'No products found in this category' });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     description: Update a product's information by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the product.
 *               price:
 *                 type: number
 *                 description: The price of the product.
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       404:
 *         description: Product not found.
 */
app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    let products = readProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], ...req.body, id: productId }; // Keep the ID
        writeProducts(products);
        res.json({ message: 'Product updated successfully' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});


/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Delete a product from the store by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       404:
 *         description: Product not found.
 */
app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    let products = readProducts();
    const initialLength = products.length;

    products = products.filter(p => p.id !== productId);

    if (products.length < initialLength) {
        writeProducts(products);
        res.json({ message: 'Product deleted successfully' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});
const server = http.createServer(app);

// 2. Создаем WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('Admin client connected via WebSocket');

    ws.on('message', message => {
        console.log(`Admin received: ${message}`);
        // Optionally, process admin messages here
    });

    ws.on('close', () => {
        console.log('Admin client disconnected from WebSocket');
    });

    ws.on('error', error => {
        console.error('Admin WebSocket error:', error);
    });

    ws.send('Welcome to the Admin WebSocket server!');
});

// Обработчик ошибок для WebSocket Server
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

// 3. Запускаем сервер
server.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
    console.log(`Admin WebSocket server also running on port ${PORT}`);
});