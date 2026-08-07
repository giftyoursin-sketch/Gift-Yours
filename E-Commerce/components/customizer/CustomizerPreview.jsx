import React, { useRef } from 'react';
import { X, Box } from 'lucide-react';

export default function CustomizerPreview({ 
  image, 
  onImageUpload, 
  onImageRemove,
  frameSize,
  frameColor,
  marginType,
  frameThickness,
  viewMode, 
  onToggleView,
  onEditRequest
}) {
  const fileInputRef = useRef(null);
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) readFile(file);
  };
  const handleDragOver = (e) => e.preventDefault();

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => onImageUpload(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { readFile(file); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  // ── Frame appearance from color selection
  const colorName = (frameColor?.name || '').toLowerCase();
  let frameBackground;
  if (colorName.includes('oak')) {
    frameBackground = 'linear-gradient(135deg, #d4a96a 0%, #c09455 30%, #d4a96a 60%, #b88040 100%)';
  } else if (colorName.includes('walnut')) {
    frameBackground = 'linear-gradient(135deg, #5b3217 0%, #3e2010 50%, #5b3217 100%)';
  } else if (colorName.includes('white') || colorName.includes('gallery')) {
    frameBackground = '#f0eeea';
  } else if (colorName.includes('black') || colorName.includes('matte')) {
    frameBackground = '#1c1c1c';
  } else {
    frameBackground = frameColor?.value || '#c09455'; // default oak
  }

  const borderWidth = (() => {
    const v = (frameThickness?.value || '').toLowerCase();
    if (v.includes('1.5') || v.includes('thick')) return 28;
    if (v.includes('1')) return 22;
    return 16; // 0.5 or default
  })();

  const hasWhiteMargin = (marginType?.name || '').toLowerCase().includes('white');

  // ── Size / Aspect ratio from selection
  const dims = (frameSize?.name || '8 x 8').toLowerCase().replace(/inches|inch/g, '').split('x').map(p => p.trim());
  const parsedW = parseFloat(dims[0]) || 8;
  const parsedH = parseFloat(dims[1]) || 8;

  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 600;
  // Reduce max preview dimensions on mobile so it fits within screen width minus label padding
  const maxPreviewW = isMobile ? windowWidth - 120 : 380; 
  const maxPreviewH = isMobile ? 350 : 480;
  let previewW, previewH;
  if (parsedW / parsedH > maxPreviewW / maxPreviewH) {
    previewW = maxPreviewW;
    previewH = maxPreviewW * (parsedH / parsedW);
  } else {
    previewH = maxPreviewH;
    previewW = maxPreviewH * (parsedW / parsedH);
  }

  return (
    <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '300px' }}>

      {/* Outer sizing labels + frame container */}
      <div style={{ position: 'relative', width: previewW + 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* TOP: Width label */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#14b8a6', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ width: '40px', height: '1.5px', background: '#14b8a6', display: 'inline-block' }} />
          {parsedW} INCHES
          <span style={{ width: '40px', height: '1.5px', background: '#14b8a6', display: 'inline-block' }} />
        </div>

        {/* LEFT: Height label */}
        <div style={{
          position: 'absolute', left: '15px', top: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#14b8a6', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em',
          whiteSpace: 'nowrap', zIndex: 10
        }}>
          <span style={{ width: '40px', height: '1.5px', background: '#14b8a6', display: 'inline-block' }} />
          {parsedH} INCHES
          <span style={{ width: '40px', height: '1.5px', background: '#14b8a6', display: 'inline-block' }} />
        </div>

        {/* Frame + Image */}
        <div style={{
          marginTop: '28px',
          width: previewW,
          height: previewH,
          background: frameBackground,
          padding: `${borderWidth}px`,
          boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12)',
          position: 'relative',
          borderRadius: '3px',
          flexShrink: 0,
        }}>
          {/* White margin area */}
          <div style={{
            width: '100%',
            height: '100%',
            background: '#fff',
            padding: hasWhiteMargin ? '10px' : '0',
            overflow: 'hidden',
          }}>
            {/* Inner image or upload zone */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: '#f8fafc',
                cursor: image ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !image && fileInputRef.current?.click()}
            >
              {image ? (
                <img
                  src={image}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', pointerEvents: 'none' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#475569', lineHeight: 1.4 }}>
                    Drop or Click to Upload<br />Image
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
      </div>

      {/* ── Bottom buttons ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onToggleView(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: '#fff', color: '#475569',
            border: '1.5px solid #e2e8f0',
            padding: '0.5rem 1rem', borderRadius: '999px',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <Box size={16} color="#14b8a6" />
          {viewMode === '3D' ? '2D View' : '3D View'}
        </button>

        {image && (
          <button
            onClick={onImageRemove}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: '#fff', color: '#475569',
              border: '1.5px solid #e2e8f0',
              padding: '0.5rem 1rem', borderRadius: '999px',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <X size={16} />
            Remove image
          </button>
        )}
      </div>
    </div>
  );
}
