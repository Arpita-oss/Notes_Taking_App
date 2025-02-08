import React, { useState } from 'react';
import NoteDetailModal from './NoteDetailModal';
import axios from 'axios';

const NoteCard = ({ note, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.description}`);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const handleUpdate = () => {
    onUpdate(note._id, { ...note, title: newTitle });
    setIsEditing(false);
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://notes-app-backend-6nc9.onrender.com/api/note/toggle-favorite/${note._id}`,
        {},
        { headers: { Authorization: token } }
      );
      onUpdate(note._id, { ...note, isFavorite: !note.isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative aspect-square flex flex-col cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate();
                }}
                className="p-1 text-green-500 hover:text-green-600"
                title="Save"
              >
                ✓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className="p-1 text-red-500 hover:text-red-600"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800">{note.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  📋
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="px-2 py-1 text-blue-500 hover:text-blue-700 transition-colors"
                  title="Rename note"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="px-2 py-1 text-red-500 hover:text-red-700 transition-colors"
                  title="Delete note"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="flex-1 p-4 overflow-auto">
          {note.image && (
            <div className="mb-4">
              <img
                src={note.image}
                alt="Note attachment"
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
          <p className="text-gray-600 whitespace-pre-wrap">{note.description}</p>
        </div>

        {/* Date Time Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xl text-gray-500">
              {note.isAudioNote ? (
                <span title="Audio Transcription Note">🎙️</span>
              ) : (
                <span title="Text Note">📝</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className={`text-xl hover:scale-110 transition-transform ${note.isFavorite ? 'text-red-500' : 'text-gray-400'
                }`}
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {note.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(note.createdAt)}
          </span>
        </div>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute bottom-16 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md">
            Copied to clipboard!
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {isModalOpen && (
        <NoteDetailModal
          note={note}
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updatedNote) => {
            onUpdate(updatedNote._id, updatedNote);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default NoteCard;