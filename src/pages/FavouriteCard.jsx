import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from '../assets/components/NoteCard';
import Navbar from '../assets/components/Navbar';
import { useNavigate } from 'react-router-dom';

const FavouriteCard = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get("https://notes-app-backend-6nc9.onrender.com/api/note/favourites", {
          headers: { Authorization: token }
        });
        
        setFavourites(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching favourites:', error);
        setLoading(false);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchFavourites();
  }, [navigate]);

  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://notes-app-backend-6nc9.onrender.com/api/note/${noteId}`, {
        headers: { Authorization: token }
      });
      setFavourites(favourites.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleUpdateNote = async (noteId, updatedNote) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://notes-app-backend-6nc9.onrender.com/api/note/${noteId}`, 
        updatedNote, 
        { headers: { Authorization: token } }
      );
      
      if (!updatedNote.isFavorite) {
        setFavourites(favourites.filter(note => note._id !== noteId));
      } else {
        setFavourites(favourites.map(note => 
          note._id === noteId ? response.data.note : note
        ));
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar />
        <div className="ml-64 w-full flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar />
      <div className="flex-1 md:ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Favourite Notes</h1>
        {favourites.length === 0 ? (
          <div className="text-center text-gray-500">
            No favourite notes yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={handleDeleteNote}
                onUpdate={handleUpdateNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouriteCard;