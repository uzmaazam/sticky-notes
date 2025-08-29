import React, { useState, useEffect, useCallback, useRef } from 'react';

interface NoteProps {
  note: {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    zIndex: number;
    color: string;
  };
  onUpdate: (id: number, updates: Partial<NoteProps['note']>) => void;
  onDrop: (id: number, x: number, y: number, width: number, height: number) => void;
  onBringToFront: (id: number) => void;
}

const Note: React.FC<NoteProps> = ({ note, onUpdate, onDrop, onBringToFront }) => {
  const [posX, setPosX] = useState(note.x);
  const [posY, setPosY] = useState(note.y);
  const [sizeWidth, setSizeWidth] = useState(note.width);
  const [sizeHeight, setSizeHeight] = useState(note.height);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialHeight, setInitialHeight] = useState(0);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosX(note.x);
    setPosY(note.y);
    setSizeWidth(note.width);
    setSizeHeight(note.height);
  }, [note.x, note.y, note.width, note.height]);

  useEffect(() => {
    if (editableRef.current && editableRef.current.innerHTML !== note.content) {
      editableRef.current.innerHTML = note.content;
    }
  }, [note.content]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const newX = Math.max(0, Math.min(e.clientX - startX, viewportWidth - sizeWidth));
      const newY = Math.max(60, Math.min(e.clientY - startY, viewportHeight - sizeHeight));
      setPosX(newX);
      setPosY(newY);
    } else if (resizing) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const newWidth = Math.max(120, Math.min(initialWidth + (e.clientX - startX), viewportWidth - posX));
      const newHeight = Math.max(120, Math.min(initialHeight + (e.clientY - startY), viewportHeight - posY));
      setSizeWidth(newWidth);
      setSizeHeight(newHeight);
    }
  }, [dragging, resizing, startX, startY, initialWidth, initialHeight, posX, posY, sizeWidth, sizeHeight]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setResizing(false);
    onUpdate(note.id, { x: posX, y: posY, width: sizeWidth, height: sizeHeight });
    if (dragging) {
      onDrop(note.id, posX, posY, sizeWidth, sizeHeight);
    }
  }, [dragging, posX, posY, sizeWidth, sizeHeight, note.id, onUpdate, onDrop]);

  useEffect(() => {
    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, resizing, handleMouseMove, handleMouseUp]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    onBringToFront(note.id);
    setStartX(e.clientX - posX);
    setStartY(e.clientY - posY);
    setDragging(true);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    onBringToFront(note.id);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setInitialWidth(sizeWidth);
    setInitialHeight(sizeHeight);
    setResizing(true);
  };

  const handleBlur = () => {
    if (editableRef.current) {
      const newContent = editableRef.current.innerHTML;
      if (newContent !== note.content) {
        onUpdate(note.id, { content: newContent });
      }
    }
  };

  return (
    <div
      className={`note ${dragging ? 'dragging' : ''}`}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${sizeWidth}px`,
        height: `${sizeHeight}px`,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
    >
      <div className="note-header" onMouseDown={startDrag}>
        <div className="note-grip" />
      </div>
      <div
        className="note-content"
        ref={editableRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
      />
      <div className="note-resize" onMouseDown={startResize} />
    </div>
  );
};

export default Note;