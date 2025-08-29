# Sticky Notes Application

This is a single-page web application for sticky notes, built with React and TypeScript as per the assessment requirements. It implements all four required features and all five optional features, with a focus on clean architecture, performance, code quality, static typing, and usability.

## Features
- **Core Features**:
  1. Create a new note at a specified position and size.
  2. Change note size by dragging the bottom-right handle.
  3. Move a note by dragging its header.
  4. Remove a note by dragging it over the trash zone (bottom center, red circular button).
- **Bonus Features**:
  1. Enter/edit note text via contentEditable.
  2. Move notes to front on interaction (z-index management).
  3. Save/restore notes to local storage on page load.
  4. Support different note colors (yellow, pink, green, blue, or random).
  5. Asynchronous mock REST API for saving/loading notes (500ms delay, with local storage backup).

## System Requirements
- **Browsers**: Latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge (tested as of August 2025).
- **Resolution**: Minimum 1024x768 (desktop only).
- **Tech Stack**: React, TypeScript, CSS (no external libraries).

## Setup Instructions
1. **Clone the Repository** (or unzip the provided archive):
   ```bash
   git clone <repository-url>
   cd sticky-notes
