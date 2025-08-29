import React, { useState, useEffect, useRef } from 'react';
import Note from './Note';
import './index.css';

interface NoteType {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  zIndex: number;
  color: string;
}

const colors = ['#fef9c3', '#fecaca', '#bbf7d0', '#c7d2fe'];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

// Mock API
let mockServerData: NoteType[] = [];
const mockDelay = 500;

const mockFetchNotes = async (): Promise<NoteType[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...mockServerData]), mockDelay));
};

const mockSaveNotes = async (notes: NoteType[]): Promise<void> => {
  return new Promise(resolve => setTimeout(() => {
    mockServerData = [...notes];
    resolve();
  }, mockDelay));
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [newX, setNewX] = useState(20);
  const [newY, setNewY] = useState(80);
  const [newWidth, setNewWidth] = useState(200);
  const [newHeight, setNewHeight] = useState(200);
  const [newColor, setNewColor] = useState('random');
  const trashRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const apiNotes = await mockFetchNotes();
        if (apiNotes.length > 0) {
          setNotes(apiNotes);
        } else {
          const local = localStorage.getItem('notes');
          if (local) setNotes(JSON.parse(local));
        }
      } catch {
        const local = localStorage.getItem('notes');
        if (local) setNotes(JSON.parse(local));
      }
    };
    loadNotes();
  }, []);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await mockSaveNotes(notes);
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch {}
    }, 300);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [notes]);

  const createNote = () => {
    const color = newColor === 'random' ? getRandomColor() : newColor;
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0;
    const maxZ = notes.length > 0 ? Math.max(...notes.map(n => n.zIndex)) : 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const constrainedX = Math.min(newX, viewportWidth - newWidth - 10);
    const constrainedY = Math.min(newY, viewportHeight - newHeight - 10);
    const newNote: NoteType = {
      id: maxId + 1,
      x: Math.max(10, constrainedX),
      y: Math.max(70, constrainedY),
      width: Math.max(150, Math.min(newWidth, viewportWidth - 20)),
      height: Math.max(150, Math.min(newHeight, viewportHeight - 80)),
      content: '',
      zIndex: maxZ + 1,
      color,
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: number, updates: Partial<NoteType>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const bringToFront = (id: number) => {
    const maxZ = Math.max(0, ...notes.map(n => n.zIndex));
    updateNote(id, { zIndex: maxZ + 1 });
  };

  const handleDrop = (id: number, x: number, y: number, width: number, height: number) => {
    if (trashRef.current) {
      const trashRect = trashRef.current.getBoundingClientRect();
      const noteRect = { left: x, top: y, right: x + width, bottom: y + height };
      if (!(noteRect.right < trashRect.left || noteRect.left > trashRect.right || 
            noteRect.bottom < trashRect.top || noteRect.top > trashRect.bottom)) {
        deleteNote(id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="toolbar fixed top-0 left-0 right-0 bg-white p-3 shadow-md z-[10000] flex flex-col sm:flex-row gap-2 items-center">
        <div className="flex flex-wrap gap-2 justify-center">
          <label className="flex flex-col text-xs font-medium text-gray-700">
            X
            <input
              type="number"
              value={newX}
              onChange={e => setNewX(+e.target.value)}
              min="0"
              className="mt-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-16 sm:w-20"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-gray-700">
            Y
            <input
              type="number"
              value={newY}
              onChange={e => setNewY(+e.target.value)}
              min="0"
              className="mt-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-16 sm:w-20"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-gray-700">
            Width
            <input
              type="number"
              value={newWidth}
              onChange={e => setNewWidth(+e.target.value)}
              min="150"
              className="mt-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-16 sm:w-20"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-gray-700">
            Height
            <input
              type="number"
              value={newHeight}
              onChange={e => setNewHeight(+e.target.value)}
              min="150"
              className="mt-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-16 sm:w-20"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-gray-700">
            Color
            <select
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="mt-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-24 sm:w-28"
            >
              <option value="random">Random</option>
              <option value="#fef9c3">Yellow</option>
              <option value="#fecaca">Pink</option>
              <option value="#bbf7d0">Green</option>
              <option value="#c7d2fe">Blue</option>
            </select>
          </label>
        </div>
        <button
          onClick={createNote}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-transform hover:scale-105 text-sm"
        >
          Create Note
        </button>
      </div>
      <div className="pt-28 sm:pt-20">
        {notes.map(note => (
          <Note
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDrop={handleDrop}
            onBringToFront={bringToFront}
          />
        ))}
      </div>
      <div
        className="trash fixed bottom-3 right-3 w-12 h-12 sm:w-14 sm:h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 transition-transform z-[9999]"
        ref={trashRef}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 4v12m4-12v12" />
        </svg>
      </div>
    </div>
  );
};

export default App;