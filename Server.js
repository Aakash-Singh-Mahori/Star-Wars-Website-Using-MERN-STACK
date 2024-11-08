const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Define a simple schema for artwork
const artworkSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    likes: { type: Number, default: 0 },
    comments: [{ user: String, comment: String }]
});

const Artwork = mongoose.model('Artwork', artworkSchema);

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.post('/upload', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const newArtwork = new Artwork({ title, description, imageUrl });
    await newArtwork.save();
    res.status(201).json(newArtwork);
});

app.get('/artworks', async (req, res) => {
    const artworks = await Artwork.find();
    res.json(artworks);
});

app.post('/artwork/:id/like', async (req, res) => {
    const artwork = await Artwork.findById(req.params.id);
    artwork.likes += 1;
    await artwork.save();
    res.json(artwork);
});

app.post('/artwork/:id/comment', async (req, res) => {
    const { user, comment } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    artwork.comments.push({ user, comment });
    await artwork.save();
    res.json(artwork);
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
