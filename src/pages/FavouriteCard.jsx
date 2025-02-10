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

        const response = await axios.get(
          "https://notes-app-backend-6nc9.onrender.com/api/note/favourites",
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        );

        setFavourites(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching favourites:', error.response?.data);
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
        <div className="flex-1 p-4 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">Almost there... We promise it's worth the wait!</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Navbar />
      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Header Section */}
        <div className="sticky top-0 bg-white shadow-sm z-10 p-4 mt-16 md:mt-0">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Favourite Notes</h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {favourites.length === 0 ? (
            <div className="text-center text-gray-500 mt-4 bg-white rounded-lg p-8 shadow-sm">
              No favourite notes yet. Add some notes to your favourites!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
    </div>
  );
};

export default FavouriteCard;