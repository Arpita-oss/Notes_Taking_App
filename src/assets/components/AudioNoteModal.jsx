import React, { useState, useRef, useEffect } from 'react';

const AudioNoteModal = ({ isOpen, onClose, AddNote }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Cleanup function to stop any ongoing recording
    return () => {
      stopRecording();
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = () => {
    // Ensure browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Try Chrome or Edge.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Setup audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);

        // Setup speech recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const results = Array.from(event.results);
          const transcript = results
            .map(result => result[0].transcript)
            .join('');
          
          setTranscript(transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          alert(`Speech recognition error: ${event.error}`);
        };

        // Start recognition and recording
        recognition.start();
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        // Save references for cleanup
        streamRef.current = stream;
        mediaRecorderRef.current = mediaRecorder;
        recognitionRef.current = recognition;
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        setIsRecording(true);
        updateAudioLevel(analyser);
      })
      .catch(error => {
        console.error('Microphone access error:', error);
        alert('Could not access microphone. Check permissions and try again.');
      });
  };

  const updateAudioLevel = (analyser) => {
    if (!analyser || !isRecording) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);
    
    requestAnimationFrame(() => updateAudioLevel(analyser));
  };

  const stopRecording = () => {
    // Stop all recording resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  const saveAudioNote = () => {
    if (!title.trim()) {
      alert('Please add a title for your note');
      return;
    }

    const imageBase64 = imagePreview || null;

    AddNote(
      title, 
      description || transcript, 
      imageBase64, 
      true, 
      transcript
    );
    
    // Reset modal state
    setTitle('');
    setDescription('');
    setTranscript('');
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-96 relative border shadow-lg">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold mb-4">Audio Note</h2>
        
        <input 
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <textarea 
          placeholder="Additional Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 p-2 border rounded h-20"
        />

        <div className="mb-3">
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="imageUpload"
          />
          <label 
            htmlFor="imageUpload" 
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Upload Image
          </label>
          {imagePreview && (
            <div className="mt-2 relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full h-40 object-cover rounded"
              />
              <button 
                onClick={removeImage}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 h-2 bg-gray-200 rounded">
          <div 
            className="h-full bg-green-500 rounded" 
            style={{ 
              width: `${isRecording ? audioLevel * 100 : 0}%`,
              transition: 'width 0.1s ease-out'
            }}
          />
        </div>
        
        <div className="mb-4">
          <textarea 
            readOnly
            value={transcript}
            placeholder="Transcription will appear here..."
            className="w-full h-32 p-2 border rounded"
          />
        </div>
        
        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Stop Recording
            </button>
          )}
          
          {transcript && (
            <button 
              onClick={saveAudioNote}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Note
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioNoteModal;