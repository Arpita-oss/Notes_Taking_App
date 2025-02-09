import React, { useState } from 'react';
import axios from 'axios';

const NoteDetailModal = ({ note, onClose, onUpdate }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({
    title: note.title,
    description: note.description,
    image: note.image
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setEditedNote(prev => ({
      ...prev,
      image: URL.createObjectURL(file)
    }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('title', editedNote.title);
      formData.append('description', editedNote.description);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await axios.put(
        `https://notes-app-backend-6nc9.onrender.com/api/note/${note._id}`,
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        onUpdate(response.data.note);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update note');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://:5000/api/note/toggle-favorite/${note._id}`,
        {},
        {
          headers: {
            'Authorization': token
          }
        }
      );

      if (response.data.success) {
        onUpdate({ ...note, isFavorite: !note.isFavorite });
      }
    } catch (error) {
      console.error('Toggle favorite failed:', error);
      alert('Failed to update favorite status');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur
        ${isFullScreen ? 'w-full h-full' : 'bg-black-400 bg-opacity-30'}`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 
          ${isFullScreen ? 'w-full h-full' : 'w-11/12 max-w-2xl max-h-[90vh]'} 
          overflow-auto relative`}
      >
        {/* Header Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="bg-gray-200 p-2 rounded-full"
          >
            {isFullScreen ? '↙️' : '↗️'}
          </button>
          <button
            onClick={onClose}
            className="bg-red-200 p-2 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Note Content */}
        {isEditing ? (
          <div>
            <input
              value={editedNote.title}
              onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
              className="w-full border p-2 mb-4"
            />
            <textarea
              value={editedNote.description}
              onChange={(e) => setEditedNote({ ...editedNote, description: e.target.value })}
              className="w-full border p-2 mb-4 h-40"
            />
            <div className="mb-4">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="mb-2"
              />
              {(selectedImage || editedNote.image) && (
                <img
                  src={selectedImage ? URL.createObjectURL(selectedImage) : editedNote.image}
                  alt="Note"
                  className="w-full h-48 object-cover mt-4 rounded"
                />
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">{note.title}</h2>
            {note.image && (
              <img
                src={note.image}
                alt="Note"
                className="w-full h-64 object-cover mb-4 rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'path/to/fallback/image.png';
                }}
              />
            )}
            <p className="mb-4">{note.description}</p>
            {note.isAudioNote && note.audioTranscription && (
              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-semibold mb-2">Audio Transcription:</h3>
                <p>{note.audioTranscription}</p>
              </div>
            )}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`px-4 py-2 rounded ${note.isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              >
                {note.isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteDetailModal;