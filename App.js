import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [artworks, setArtworks] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', image: null });

    useEffect(() => {
        axios.get('http://localhost:5000/artworks')
            .then(response => setArtworks(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('image', formData.image);

        try {
            await axios.post('http://localhost:5000/upload', data);
            window.location.reload(); // Quick way to refresh and show new artwork
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = async (id) => {
        try {
            await axios.post(`http://localhost:5000/artwork/${id}/like`);
            setArtworks(artworks.map(artwork =>
                artwork._id === id ? { ...artwork, likes: artwork.likes + 1 } : artwork
            ));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="App">
            <h1>Star Wars Fan Art Gallery</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Title" onChange={handleInputChange} required />
                <input type="text" name="description" placeholder="Description" onChange={handleInputChange} required />
                <input type="file" onChange={handleFileChange} required />
                <button type="submit">Upload Artwork</button>
            </form>
            <div className="art-gallery">
                {artworks.map(art => (
                    <div key={art._id} className="art-card">
                        <h3>{art.title}</h3>
                        <img src={`http://localhost:5000${art.imageUrl}`} alt={art.title} />
                        <p>{art.description}</p>
                        <p>Likes: {art.likes}</p>
                        <button onClick={() => handleLike(art._id)}>Like</button>
                        {/* Comments section can be expanded here */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
