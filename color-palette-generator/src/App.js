import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [palette, setPalette] = useState([]);
  const [paletteHistory, setPaletteHistory] = useState([]);
  const [lockedColors, setLockedColors] = useState([]);

  // Generate random hex color
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate a palette of 5 colors
  const generatePalette = () => {
    const newPalette = [];
    for (let i = 0; i < 5; i++) {
      if (lockedColors[i]) {
        newPalette.push(palette[i]);
      } else {
        newPalette.push(generateRandomColor());
      }
    }
    setPalette(newPalette);
    
    // Add to history if it's a completely new palette
    if (newPalette.length > 0 && !lockedColors.some(locked => locked)) {
      setPaletteHistory(prev => [newPalette, ...prev.slice(0, 9)]); // Keep last 10
    }
  };

  // Copy color to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(() => {
      // Show temporary feedback
      const event = new CustomEvent('colorCopied', { detail: { color } });
      window.dispatchEvent(event);
    });
  };

  // Show copy feedback
  const [copiedColor, setCopiedColor] = useState('');
  
  useEffect(() => {
    const handleColorCopied = (event) => {
      setCopiedColor(event.detail.color);
      setTimeout(() => setCopiedColor(''), 2000);
    };
    
    window.addEventListener('colorCopied', handleColorCopied);
    return () => window.removeEventListener('colorCopied', handleColorCopied);
  }, []);

  // Toggle lock state for a color
  const toggleLock = (index) => {
    const newLockedColors = [...lockedColors];
    newLockedColors[index] = !newLockedColors[index];
    setLockedColors(newLockedColors);
  };

  // Load palette from history
  const loadPalette = (historicalPalette) => {
    setPalette(historicalPalette);
    setLockedColors([false, false, false, false, false]);
  };

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Check if color is light or dark for text contrast
  const isLightColor = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return true;
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  };

  // Generate initial palette on component mount
  useEffect(() => {
    generatePalette();
    setLockedColors([false, false, false, false, false]);
  }, []);

  // Handle spacebar press to generate new palette
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        generatePalette();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lockedColors, palette]);

  return (
    <div className="App">
      <header className="header">
        <h1>🎨 Color Palette Generator</h1>
        <p>Hover over colors to reveal controls • Use lock button to preserve colors • Copy button or click card to copy hex codes • Press spacebar for new palette</p>
      </header>

      <main className="main-content">
        <div className="palette-container">
          {palette.map((color, index) => (
            <div
              key={index}
              className="color-card"
              style={{ backgroundColor: color }}
            >
              <div className="color-overlay">
                <div className="color-controls">
                  <button
                    className={`lock-button ${lockedColors[index] ? 'locked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(index);
                    }}
                    title={lockedColors[index] ? 'Unlock color' : 'Lock color'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      {lockedColors[index] ? (
                        <path d="M6 10v-4a6 6 0 1 1 12 0v4h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h1zm2 0h8v-4a4 4 0 0 0-8 0v4z"/>
                      ) : (
                        <path d="M10 10v-4a2 2 0 1 1 4 0v4h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h5zm2-4v4h2v-4a2 2 0 0 0-4 0z"/>
                      )}
                    </svg>
                  </button>
                  
                  <button
                    className="copy-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(color);
                    }}
                    title="Copy hex code"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/>
                    </svg>
                  </button>
                </div>
                
                <div 
                  className="color-info"
                  style={{ color: isLightColor(color) ? '#333' : '#fff' }}
                >
                  <div className="hex-code">
                    {color}
                    {copiedColor === color && <span className="copied-indicator">Copied!</span>}
                  </div>
                  <div className="rgb-code">
                    {(() => {
                      const rgb = hexToRgb(color);
                      return rgb ? `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
                    })()}
                  </div>
                  <div className="copy-hint">Click copy button or card to copy</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="controls">
          <button className="generate-btn" onClick={generatePalette}>
            Generate New Palette
          </button>
          <button 
            className="clear-locks-btn" 
            onClick={() => setLockedColors([false, false, false, false, false])}
          >
            Clear All Locks
          </button>
        </div>

        {paletteHistory.length > 0 && (
          <div className="history-section">
            <h3>Palette History</h3>
            <div className="history-container">
              {paletteHistory.map((historicalPalette, paletteIndex) => (
                <div 
                  key={paletteIndex} 
                  className="history-palette"
                  onClick={() => loadPalette(historicalPalette)}
                >
                  {historicalPalette.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="history-color"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Made with React • Click colors to copy • Use spacebar for quick generation</p>
      </footer>
    </div>
  );
}

export default App;