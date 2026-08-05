import React, { useEffect, useRef, useState, useCallback } from 'react';

const MIN_CROP = 60;

// ─── Canvas-based professional photo editor ─────────────────────────────────
// All transform state lives in refs for the rAF draw loop (no stale closures).
// Only UI display values live in React state.
export default function PhotoEditorModal({ image, aspect = 1, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const imageEl   = useRef(null);     // HTMLImageElement
  const rafId     = useRef(null);

  // ── mutable transform refs (read by draw loop at 60fps) ──
  const img  = useRef({ x:0, y:0, scale:1, rotation:0, flipH:false, flipV:false });
  const crop = useRef({ x:0, y:0, w:0, h:0 });
  const drag = useRef({ active:false, mode:'none', handle:'', sx:0, sy:0, lx:0, ly:0, snapCrop:null, snapImg:null });
  const pinch = useRef({ active:false, startDist:0, startScale:1, startX:0, startY:0 });

  // ── canvas logical size ──
  const cW = useRef(800);
  const cH = useRef(560);

  // ── React UI state (sliders, labels) ──
  const [rotDeg, setRotDeg]   = useState(0);
  const [zoomPct, setZoomPct] = useState(50);
  const [, forceUpdate] = useState(0);

  // ── Load image and init layout ──
  const initLayout = useCallback((el) => {
    imageEl.current = el;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.parentElement?.clientWidth  || 800;
    const H = canvas.parentElement?.clientHeight || 560;
    cW.current = W;
    cH.current = H;
    canvas.width  = W;
    canvas.height = H;

    const baseScale = Math.min(W / el.naturalWidth, H / el.naturalHeight) * 0.82;
    const iw = el.naturalWidth  * baseScale;
    const ih = el.naturalHeight * baseScale;
    img.current = {
      x: (W - iw) / 2,
      y: (H - ih) / 2,
      scale: baseScale,
      rotation: 0,
      flipH: false,
      flipV: false,
    };

    // Crop: fit within image with correct aspect ratio
    const ratio = aspect;
    let cw, ch;
    if (iw / ih > ratio) { ch = ih * 0.88; cw = ch * ratio; }
    else                  { cw = iw * 0.88; ch = cw / ratio; }
    crop.current = {
      x: img.current.x + (iw - cw) / 2,
      y: img.current.y + (ih - ch) / 2,
      w: cw, h: ch,
    };

    setRotDeg(0);
    setZoomPct(50);
    forceUpdate(n => n + 1);
  }, [aspect]);

  useEffect(() => {
    const el = new Image();
    el.onload = () => initLayout(el);
    el.src = image;
    return () => { el.onload = null; };
  }, [image, initLayout]);

  // ── Draw loop ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const el = imageEl.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const s = img.current;
    const c = crop.current;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, W, H);

    // Draw image with transform
    const iw = el.naturalWidth  * s.scale;
    const ih = el.naturalHeight * s.scale;
    const cx = s.x + iw / 2;
    const cy = s.y + ih / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1);
    ctx.translate(-cx, -cy);
    ctx.drawImage(el, s.x, s.y, iw, ih);
    ctx.restore();

    // Dark overlay outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, c.y);
    ctx.fillRect(0, c.y + c.h, W, H - c.y - c.h);
    ctx.fillRect(0, c.y, c.x, c.h);
    ctx.fillRect(c.x + c.w, c.y, W - c.x - c.w, c.h);

    // Crop border
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(c.x, c.y, c.w, c.h);

    // Rule-of-thirds grid
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(c.x + c.w * i / 3, c.y);
      ctx.lineTo(c.x + c.w * i / 3, c.y + c.h);
      ctx.moveTo(c.x, c.y + c.h * i / 3);
      ctx.lineTo(c.x + c.w, c.y + c.h * i / 3);
    }
    ctx.stroke();

    // L-shaped corner handles
    const L = 16, T = 3;
    ctx.fillStyle = '#ffffff';
    const corners = [
      { x: c.x,       y: c.y,       dx: 1,  dy: 1 },
      { x: c.x + c.w, y: c.y,       dx: -1, dy: 1 },
      { x: c.x,       y: c.y + c.h, dx: 1,  dy: -1 },
      { x: c.x + c.w, y: c.y + c.h, dx: -1, dy: -1 },
    ];
    corners.forEach(({ x, y, dx, dy }) => {
      ctx.fillRect(x - T/2 * (dx > 0 ? -1 : 1), y - T/2 * (dy > 0 ? -1 : 1), L * dx, T * dy > 0 ? T : -T);
      ctx.fillRect(x - T/2 * (dx > 0 ? -1 : 1), y - T/2 * (dy > 0 ? -1 : 1), T * dx > 0 ? T : -T, L * dy);
    });

    // Edge mid handles
    const midEdges = [
      { x: c.x + c.w / 2, y: c.y },
      { x: c.x + c.w / 2, y: c.y + c.h },
      { x: c.x,           y: c.y + c.h / 2 },
      { x: c.x + c.w,     y: c.y + c.h / 2 },
    ];
    midEdges.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  }, []);

  // rAF loop
  useEffect(() => {
    const loop = () => { draw(); rafId.current = requestAnimationFrame(loop); };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, [draw]);

  // ── Pointer utilities ──
  const getXY = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width  / rect.width;
    const sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const hitHandle = (px, py) => {
    const c = crop.current;
    const R = 14;
    if (Math.hypot(px - c.x,       py - c.y)       < R) return 'tl';
    if (Math.hypot(px - (c.x+c.w), py - c.y)       < R) return 'tr';
    if (Math.hypot(px - c.x,       py - (c.y+c.h)) < R) return 'bl';
    if (Math.hypot(px - (c.x+c.w), py - (c.y+c.h)) < R) return 'br';
    if (Math.abs(px - (c.x+c.w/2)) < R && Math.abs(py - c.y)       < R) return 't';
    if (Math.abs(px - (c.x+c.w/2)) < R && Math.abs(py - (c.y+c.h)) < R) return 'b';
    if (Math.abs(px - c.x)         < R && Math.abs(py - (c.y+c.h/2)) < R) return 'l';
    if (Math.abs(px - (c.x+c.w))   < R && Math.abs(py - (c.y+c.h/2)) < R) return 'r';
    return null;
  };

  const insideCrop = (px, py) => {
    const c = crop.current;
    return px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h;
  };

  // ── Mouse / Touch down ──
  const onDown = useCallback((e) => {
    e.preventDefault();
    const { x, y } = getXY(e);

    // Two-finger pinch start
    if (e.touches && e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      pinch.current = { active: true, startDist: dist, startScale: img.current.scale, startX: (t0.clientX + t1.clientX) / 2, startY: (t0.clientY + t1.clientY) / 2 };
      return;
    }

    const handle = hitHandle(x, y);
    drag.current = {
      active: true,
      mode: handle ? 'handle' : insideCrop(x, y) ? 'crop' : 'image',
      handle: handle || '',
      sx: x, sy: y,
      lx: x, ly: y,
      snapCrop: { ...crop.current },
      snapImg:  { ...img.current },
    };
  }, []);

  // ── Mouse / Touch move ──
  const onMove = useCallback((e) => {
    e.preventDefault();

    // Pinch zoom
    if (e.touches && e.touches.length === 2 && pinch.current.active) {
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const newScale = Math.max(0.05, Math.min(20, pinch.current.startScale * (dist / pinch.current.startDist)));
      const mx = ((t0.clientX + t1.clientX) / 2 - rect.left) * scaleX;
      const my = ((t0.clientY + t1.clientY) / 2 - rect.top)  * (canvas.height / rect.height);
      const ratio = newScale / img.current.scale;
      img.current = {
        ...img.current,
        scale: newScale,
        x: mx - (mx - img.current.x) * ratio,
        y: my - (my - img.current.y) * ratio,
      };
      const scaledPct = Math.round(((newScale - 0.05) / (20 - 0.05)) * 100);
      setZoomPct(scaledPct);
      return;
    }

    if (!drag.current.active) return;

    const { x, y } = getXY(e);
    const dx = x - drag.current.lx;
    const dy = y - drag.current.ly;
    drag.current.lx = x;
    drag.current.ly = y;

    const totalDx = x - drag.current.sx;
    const totalDy = y - drag.current.sy;

    if (drag.current.mode === 'image' || drag.current.mode === 'crop') {
      // Both image-area drag and crop-area drag → move the image
      const newX = img.current.x + dx;
      const newY = img.current.y + dy;
      img.current = clampImg({ ...img.current, x: newX, y: newY }, crop.current, imageEl.current);

    } else if (drag.current.mode === 'handle') {
      const sc = drag.current.snapCrop;
      let { x: nx, y: ny, w: nw, h: nh } = sc;

      switch (drag.current.handle) {
        case 'br': 
          nw = Math.max(MIN_CROP, sc.w + totalDx); 
          nh = Math.max(MIN_CROP, sc.h + totalDy); 
          break;
        case 'tl': 
          nw = Math.max(MIN_CROP, sc.w - totalDx); 
          nh = Math.max(MIN_CROP, sc.h - totalDy); 
          nx = sc.x + sc.w - nw; 
          ny = sc.y + sc.h - nh; 
          break;
        case 'tr': 
          nw = Math.max(MIN_CROP, sc.w + totalDx); 
          nh = Math.max(MIN_CROP, sc.h - totalDy); 
          ny = sc.y + sc.h - nh; 
          break;
        case 'bl': 
          nw = Math.max(MIN_CROP, sc.w - totalDx); 
          nh = Math.max(MIN_CROP, sc.h + totalDy); 
          nx = sc.x + sc.w - nw; 
          break;
        case 't':  
          nh = Math.max(MIN_CROP, sc.h - totalDy); 
          ny = sc.y + sc.h - nh; 
          break;
        case 'b':  
          nh = Math.max(MIN_CROP, sc.h + totalDy); 
          break;
        case 'l':  
          nw = Math.max(MIN_CROP, sc.w - totalDx); 
          nx = sc.x + sc.w - nw; 
          break;
        case 'r':  
          nw = Math.max(MIN_CROP, sc.w + totalDx); 
          break;
      }

      const el = imageEl.current;
      if (el) {
        const iw = el.naturalWidth * img.current.scale;
        const ih = el.naturalHeight * img.current.scale;
        const ix = img.current.x;
        const iy = img.current.y;
        
        // Clamp crop box so it never exceeds the image boundaries
        if (nx < ix) { nw -= (ix - nx); nx = ix; }
        if (ny < iy) { nh -= (iy - ny); ny = iy; }
        if (nx + nw > ix + iw) { nw = ix + iw - nx; }
        if (ny + nh > iy + ih) { nh = iy + ih - ny; }
        
        nw = Math.max(MIN_CROP, nw);
        nh = Math.max(MIN_CROP, nh);
      }
      
      crop.current = { x: nx, y: ny, w: nw, h: nh };
    }
  }, [aspect]);

  const onUp = useCallback(() => {
    drag.current.active = false;
    pinch.current.active = false;
  }, []);

  // ── Clamp image so it always covers the crop box (no empty gaps) ──
  const clampImg = (imgState, cropState, el) => {
    if (!el) return imgState;
    const iw = el.naturalWidth  * imgState.scale;
    const ih = el.naturalHeight * imgState.scale;
    const c  = cropState;
    // Image must cover all four sides of the crop box
    let x = Math.min(imgState.x, c.x);           // left edge of img ≤ left of crop
    x = Math.max(x, c.x + c.w - iw);            // right edge of img ≥ right of crop
    let y = Math.min(imgState.y, c.y);           // top edge of img ≤ top of crop
    y = Math.max(y, c.y + c.h - ih);            // bottom edge of img ≥ bottom of crop
    return { ...imgState, x, y };
  };

  // ── Wheel zoom (towards cursor, clamped) ──
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    const newScale = Math.max(0.05, Math.min(20, img.current.scale * factor));
    const ratio = newScale / img.current.scale;
    const zoomed = {
      ...img.current,
      scale: newScale,
      x: mx - (mx - img.current.x) * ratio,
      y: my - (my - img.current.y) * ratio,
    };
    img.current = clampImg(zoomed, crop.current, imageEl.current);
    const pct = Math.round(((newScale - 0.05) / (20 - 0.05)) * 100);
    setZoomPct(pct);
  }, []);

  // ── Action buttons ──
  const rotateBy = (deg) => {
    img.current = { ...img.current, rotation: (img.current.rotation + deg + 360) % 360 };
    setRotDeg((img.current.rotation));
  };
  const flipH = () => { img.current = { ...img.current, flipH: !img.current.flipH }; forceUpdate(n=>n+1); };
  const flipV = () => { img.current = { ...img.current, flipV: !img.current.flipV }; forceUpdate(n=>n+1); };

  const doFit = () => {
    if (!imageEl.current) return;
    const el = imageEl.current;
    const scale = Math.min(cW.current / el.naturalWidth, cH.current / el.naturalHeight) * 0.85;
    img.current = { ...img.current, scale, x: (cW.current - el.naturalWidth * scale) / 2, y: (cH.current - el.naturalHeight * scale) / 2 };
    setZoomPct(50);
  };
  const doFill = () => {
    if (!imageEl.current) return;
    const el = imageEl.current;
    const c = crop.current;
    const scale = Math.max(c.w / el.naturalWidth, c.h / el.naturalHeight) * 1.02;
    img.current = { ...img.current, scale, x: c.x + (c.w - el.naturalWidth * scale) / 2, y: c.y + (c.h - el.naturalHeight * scale) / 2 };
    setZoomPct(70);
  };
  const doCenter = () => {
    if (!imageEl.current) return;
    const el = imageEl.current;
    const c = crop.current;
    const s = img.current.scale;
    img.current = { ...img.current, x: c.x + (c.w - el.naturalWidth * s) / 2, y: c.y + (c.h - el.naturalHeight * s) / 2 };
  };
  const doReset = useCallback(() => {
    if (!imageEl.current) return;
    initLayout(imageEl.current);
  }, [initLayout]);

  // Zoom slider
  const handleZoomSlider = (val) => {
    setZoomPct(val);
    if (!imageEl.current) return;
    const el = imageEl.current;
    const newScale = 0.05 + (val / 100) * (20 - 0.05);
    const cx = img.current.x + el.naturalWidth  * img.current.scale / 2;
    const cy = img.current.y + el.naturalHeight * img.current.scale / 2;
    img.current = {
      ...img.current, scale: newScale,
      x: cx - el.naturalWidth  * newScale / 2,
      y: cy - el.naturalHeight * newScale / 2,
    };
  };

  // Rotation slider
  const handleRotSlider = (val) => {
    setRotDeg(val);
    img.current = { ...img.current, rotation: val };
  };

  // ── Done: render crop region to high-res canvas ──
  const handleDone = () => {
    if (!imageEl.current) return;
    const el = imageEl.current;
    const s  = img.current;
    const c  = crop.current;

    // Use a high resolution base for crisp printing quality
    const OUTPUT_W = 2400;
    // Calculate the actual aspect ratio of the user's free-form crop
    const actualCropAspect = c.w / c.h;
    const OUTPUT_H = Math.round(OUTPUT_W / actualCropAspect);
    
    const out = document.createElement('canvas');
    out.width  = OUTPUT_W;
    out.height = OUTPUT_H;
    const ctx = out.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);

    const scaleX = OUTPUT_W / c.w;
    const scaleY = OUTPUT_H / c.h;

    const iw = el.naturalWidth  * s.scale;
    const ih = el.naturalHeight * s.scale;
    const pivX = (s.x + iw / 2) * scaleX;
    const pivY = (s.y + ih / 2) * scaleY;

    ctx.save();
    ctx.translate(-c.x * scaleX, -c.y * scaleY);
    ctx.translate(pivX, pivY);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1);
    ctx.translate(-pivX, -pivY);
    ctx.drawImage(el, s.x * scaleX, s.y * scaleY, iw * scaleX, ih * scaleY);
    ctx.restore();

    onSave(out.toDataURL('image/jpeg', 1.0));
  };

  // ── Directional nudge (clamped to crop boundary) ──
  const nudgeStep = 12;
  const nudge = (dx, dy) => {
    const moved = { ...img.current, x: img.current.x + dx, y: img.current.y + dy };
    img.current = clampImg(moved, crop.current, imageEl.current);
  };

  // ── Styles ──
  const btn = (color = '#2c2c2c') => ({
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: color, color: '#fff', border: 'none',
    padding: '0.375rem 0.75rem', borderRadius: '6px',
    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'background 0.15s',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#111', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif', userSelect: 'none' }}>
      
      {/* ── Header ── */}
      <div style={{ height: '52px', background: '#1a1a1a', borderBottom: '1px solid #252525', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '1rem', flexShrink: 0 }}>
        <button onClick={onCancel} style={btn('#333')}>← Go Back</button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button onClick={doFit}    style={btn()}>⛶ Fit</button>
          <button onClick={doFill}   style={btn()}>⬛ Fill</button>
          <button onClick={doCenter} style={btn()}>⊙ Center</button>
          <button onClick={doReset}  style={btn('#444')}>↺ Reset</button>
        </div>

        <button onClick={handleDone} style={{ background: '#eab308', color: '#000', border: 'none', padding: '0.5rem 1.75rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 700 }}>
          Done ✓
        </button>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'crosshair', minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          onWheel={onWheel}
        />
        <div style={{ position: 'absolute', top: '0.625rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.48)', color: '#bbb', fontSize: '0.6875rem', padding: '0.25rem 0.875rem', borderRadius: '999px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          Drag image to reposition · Scroll to zoom · Drag handles to resize crop
        </div>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div style={{ background: '#181818', borderTop: '1px solid #252525', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0, flexWrap: 'wrap' }}>
        
        {/* Transform buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          <button onClick={() => rotateBy(-90)} style={btn()}>↺ −90°</button>
          <button onClick={() => rotateBy(90)}  style={btn()}>↻ +90°</button>
          <button onClick={flipH} style={btn()}>⇔ Flip H</button>
          <button onClick={flipV} style={btn()}>⇕ Flip V</button>
        </div>

        {/* ── Directional nudge buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <span style={{ color: '#555', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '2px' }}>MOVE</span>
          {/* Up */}
          <button
            onClick={() => nudge(0, -nudgeStep)}
            style={{ background: '#2c2c2c', color: '#fff', border: 'none', width: '32px', height: '24px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Move Up"
          >▲</button>
          {/* Left, Down, Right in a row */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={() => nudge(-nudgeStep, 0)}
              style={{ background: '#2c2c2c', color: '#fff', border: 'none', width: '32px', height: '24px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Move Left"
            >◀</button>
            <button
              onClick={() => nudge(0, nudgeStep)}
              style={{ background: '#2c2c2c', color: '#fff', border: 'none', width: '32px', height: '24px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Move Down"
            >▼</button>
            <button
              onClick={() => nudge(nudgeStep, 0)}
              style={{ background: '#2c2c2c', color: '#fff', border: 'none', width: '32px', height: '24px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Move Right"
            >▶</button>
          </div>
        </div>

        {/* Rotation slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: '140px' }}>
          <span style={{ color: '#555', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em' }}>ROT</span>
          <input type="range" min={-180} max={180} step={0.5} value={rotDeg}
            onChange={e => handleRotSlider(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#14b8a6' }}
          />
          <span style={{ color: '#14b8a6', fontSize: '0.8rem', fontWeight: 700, width: '38px', textAlign: 'right', flexShrink: 0 }}>{rotDeg > 0 ? '+' : ''}{Math.round(rotDeg)}°</span>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ color: '#555', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em' }}>ZOOM</span>
          <button onClick={() => handleZoomSlider(Math.max(0, zoomPct - 8))} style={{ ...btn(), padding: '0.25rem 0.5rem', fontSize: '1rem' }}>−</button>
          <input type="range" min={0} max={100} step={1} value={zoomPct}
            onChange={e => handleZoomSlider(parseFloat(e.target.value))}
            style={{ width: '110px', accentColor: '#14b8a6' }}
          />
          <button onClick={() => handleZoomSlider(Math.min(100, zoomPct + 8))} style={{ ...btn(), padding: '0.25rem 0.5rem', fontSize: '1rem' }}>+</button>
        </div>

      </div>
    </div>
  );
}
