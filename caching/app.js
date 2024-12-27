const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');

// Create an Express app
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis client configuration
const client = createClient({
    username: 'default',
    password: 'lYONRM2LrTCfDHUHo8RmdSTFQiwHlvLz',
    socket: {
        host: 'redis-10358.c74.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 10358,
    },
});

client.on('error', (err) => console.error('Redis Client Error:', err));

// Connect Redis
(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis successfully.');

        // Example Redis operation
        await client.set('foo', 'bar');
        const result = await client.get('foo');
        console.log(`Redis get result: ${result}`); // >>> bar
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
})();

// Connect to MongoDB
const mongoURI = "mongodb+srv://admin:admin123@pawan.zolo6q3.mongodb.net/caching?retryWrites=true&w=majority&appName=pawan";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define a User schema and model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
// Route to create a user
app.post('/create', async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const newUser = new User({ name, email, age });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// Route to view a specific user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check Redis cache first
        const cachedUser = await client.get(`user:profile:${id}`);
        if (cachedUser) {
            console.log("Cache hit: User data served from Redis");

            // Optionally delete the cache
            await client.del(`user:profile:${id}`);
            console.log(`Cache for user:profile:${id} deleted`);

            return res.status(200).json(JSON.parse(cachedUser));
        }

        // If not in cache, fetch from MongoDB
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cache the user data in Redis for future requests
        await client.set(`user:profile:${id}`, JSON.stringify(user), {
            EX: 3600, // Set cache expiry to 1 hour
        });

        console.log("Cache miss: User data fetched from MongoDB and cached");
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user', error });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
