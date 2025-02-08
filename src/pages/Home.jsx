import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import NoteModal from '../assets/components/NoteModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NoteCard from '../assets/components/NoteCard';
import AudioNoteModal from '../assets/components/AudioNoteModal';

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
 

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const { data } = await axios.get("https://notes-app-backend-6nc9.onrender.com/api/note", {
        headers: {
          'Authorization': token
        }
      });
      setNotes(data.Notes);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onClose = () => {
    setModalOpen(false);
    fetchNotes();
  };

  const AddNote = async (title, description, image, isAudioNote = false, audioTranscription = '') => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }
  
      const response = await axios.post(
        "https://notes-app-backend-6nc9.onrender.com/api/note/add",
        { 
          title, 
          description, 
          image, 
          isAudioNote, 
          audioTranscription 
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 201) {
        onClose();
        fetchNotes();
        alert("Note added successfully!");
      }
    } catch (error) {
      console.error("Full error:", error);
      alert(error.response?.data?.message || "Error adding note");
      
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://notes-app-backend-6nc9.onrender.com/api/note/${noteId}`, {
        headers: {
          'Authorization': token
        }
      });
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleUpdateNote = async (noteId, updatedNote) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://notes-app-backend-6nc9.onrender.com/api/note/${noteId}`, updatedNote, {
        headers: {
          'Authorization': token
        }
      });
      fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const getFilteredAndSortedNotes = () => {
    if (!notes) return [];
    
    let filteredNotes = [...notes];
    
    // Apply search filter
    if (searchQuery) {
      filteredNotes = filteredNotes.filter(note => 
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return filteredNotes.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  };

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Navbar />
      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Search and Sort Bar */}
        <div className="sticky top-0 bg-white shadow-sm z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 hidden md:inline">Sort by:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="container mx-auto px-4 py-8">
          {notes && notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredAndSortedNotes().map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onUpdate={handleUpdateNote}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              No notes yet. Click the + button to create one!
            </div>
          )}
        </div>

        {/* Floating Buttons */}
        <div className="fixed bottom-4 right-4 z-20 flex space-x-4">
          <button
            onClick={() => setIsAudioModalOpen(true)}
            className="text-2xl bg-blue-500 text-white font-bold p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            🎤
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="text-2xl bg-teal-500 text-white font-bold p-4 rounded-full shadow-lg hover:bg-teal-600 transition-colors"
          >
            +
          </button>
        </div>

        {/* Modals */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={onClose}
          AddNote={AddNote}
        />
        <AudioNoteModal
          isOpen={isAudioModalOpen}
          onClose={() => setIsAudioModalOpen(false)}
          AddNote={AddNote}
        />
      </div>
    </div>
  );
};

export default Home;