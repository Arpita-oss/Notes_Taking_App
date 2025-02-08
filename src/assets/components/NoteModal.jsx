import React, { useState } from 'react';
import { FaTimes, FaImage, FaPlus } from 'react-icons/fa';


const NoteModal = ({ isOpen, onClose, AddNote }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await AddNote(title, description, image);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-96 relative shadow-lg border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Create New Note</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-4 h-32 resize-none"
        />

        <div className="mb-4">
          <label
            htmlFor="image-upload"
            className="flex items-center cursor-pointer bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            <FaImage className="mr-2" />
            Upload Image
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {image && (
            <img
              src={image}
              alt="Preview"
              className="mt-2 w-full h-40 object-cover rounded"
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white p-2 rounded flex items-center justify-center hover:bg-green-600"
        >
          <FaPlus className="mr-2" />
          Add Note
        </button>
      </div>
    </div>
  );
}

export default NoteModal;