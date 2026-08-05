import React from 'react';
import { ShoppingBag, Bookmark, ChevronDown, Repeat } from 'lucide-react';

const LABEL = (text) => ({
  fontSize: '11px', fontWeight: 700, color: '#94a3b8',
  letterSpacing: '0.09em', textTransform: 'uppercase',
  display: 'block', marginBottom: '10px',
});

const CARD_BASE = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '7px', padding: '14px 8px 12px',
  borderRadius: '14px', border: '2px solid transparent',
  background: '#f1f5f9', cursor: 'pointer',
  transition: 'all 0.18s ease', outline: 'none',
};
const CARD_ACTIVE = {
  background: '#ffffff',
  border: '2px solid #14b8a6',
  boxShadow: '0 2px 16px rgba(20,184,166,0.12)',
};

const COLOR_MAP = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('natural') || n.includes('oak'))   return '#c8a06b';
  if (n.includes('walnut'))                          return '#5c2a0a';
  if (n.includes('black'))                           return '#1a1a1a';
  if (n.includes('white') || n.includes('gallery'))  return '#f0eeec';
  return '#9ca3af';
};

// --- Hardcoded Options ---
const COLORS = [
  { id: 'c1', name: 'Natural Oak' },
  { id: 'c2', name: 'Matte Black' },
  { id: 'c3', name: 'Gallery White' },
  { id: 'c4', name: 'Walnut Brown' }
];

const MARGINS = [
  { id: 'm1', name: 'White Margin' },
  { id: 'm2', name: 'No Margin' }
];

const PAPERS = [
  { id: 'p1', name: 'Matte' },
  { id: 'p2', name: 'Gloss' },
  { id: 'p3', name: 'Glitter' }
];

const WRAPS = [
  { id: 'w1', name: 'Mounted Canvas' },
  { id: 'w2', name: 'Gallery Wrap' }
];

export default function CustomizerControls({
  product, parsedSize, availableSizes, selections, onSelectionChange, onSizeChange,
  activeTab, setActiveTab, totalPrice,
  onAddToCart, addedToCart, isOutOfStock,
}) {
  
  // ── Price ─────────────────────────────────────────────────────────
  const price = totalPrice || 0;
  // Mock original price for reference strike-through matching
  const origPrice = price > 0 ? Math.round(price * 1.5) : 0;

  const tabs = ['Photo Frame'];

  return (
    <div style={{
      flex: '1 1 420px', maxWidth: '480px', minWidth: '300px',
      background: '#ffffff', borderRadius: '20px',
      padding: '24px 24px 20px',
      boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
      display: 'flex', flexDirection: 'column', gap: '18px',
    }}>

      {/* ── PRODUCT TABS ─────────────────────────────────────────── */}
      <div>
        <span style={LABEL()}>PRODUCT</span>
        <div style={{
          display: 'flex', background: '#f1f5f9',
          borderRadius: '999px', padding: '4px', gap: '3px',
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '8px 4px', borderRadius: '999px', border: 'none',
              background: activeTab === tab ? '#ffffff' : 'transparent',
              color: activeTab === tab ? '#1e293b' : '#64748b',
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: '13px', cursor: 'pointer',
              boxShadow: activeTab === tab ? '0 1px 6px rgba(0,0,0,0.09)' : 'none',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── SELECT SIZE ────────────────────────────────────────── */}
      <div>
        <span style={LABEL()}>SELECT SIZE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Single Size Select */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select 
              value={`${parsedSize.w} x ${parsedSize.h}`} 
              onChange={(e) => {
                const parts = e.target.value.split('x').map(p => p.trim());
                if (parts.length === 2) onSizeChange(parts[0], parts[1]);
              }}
              style={{
                appearance: 'none', WebkitAppearance: 'none',
                border: '1.5px solid #e2e8f0', borderRadius: '10px',
                background: '#fff', padding: '9px 34px 9px 13px',
                fontSize: '14px', fontWeight: 500, color: '#1e293b',
                cursor: 'pointer', outline: 'none', minWidth: '130px',
              }}
            >
              {(availableSizes || []).map(sizeStr => (
                <option key={sizeStr} value={sizeStr}>{sizeStr} Inch</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          </div>

          {/* Orientation Swap Icon */}
          <button 
            type="button"
            onClick={() => onSizeChange(parsedSize.h, parsedSize.w)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
            }}
            title="Swap Horizontal/Vertical"
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <Repeat size={16} />
          </button>

          {/* Price — right aligned, exactly like reference */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: '5px', flexShrink: 0 }}>
            {origPrice > price && (
              <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 400 }}>
                ₹{origPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 700 }}>₹</span>
            <span style={{ fontSize: '28px', color: '#1e293b', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px' }}>
              {price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PHOTO FRAME TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'Photo Frame' && (
        <>
          {/* FRAME COLOR */}
          <div>
            <span style={LABEL()}>FRAME COLOR</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(4, 1fr)`,
              gap: '8px',
            }}>
              {COLORS.map(c => {
                const on = selections.color?.id === c.id;
                return (
                  <button key={c.id} onClick={() => onSelectionChange('color', c)}
                    style={{ ...CARD_BASE, ...(on ? CARD_ACTIVE : {}), padding: '12px 6px 10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: COLOR_MAP(c.name),
                      border: '2px solid rgba(0,0,0,0.07)', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: on ? '#14b8a6' : '#64748b', textAlign: 'center', lineHeight: 1.3 }}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MARGIN */}
          <div>
            <span style={LABEL()}>MARGIN</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, 1fr)`,
              gap: '10px',
            }}>
              {MARGINS.map(m => {
                const on = selections.margin?.id === m.id;
                return (
                  <button key={m.id} onClick={() => onSelectionChange('margin', m)}
                    style={{ ...CARD_BASE, ...(on ? CARD_ACTIVE : {}), gap: '8px', padding: '16px 8px 14px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '8px',
                      background: m.name.includes('White') ? '#f8fafc' : '#475569',
                      border: '1px solid #e2e8f0',
                      position: 'relative'
                    }}>
                       {/* Simulate small picture inside margin for visual match to reference */}
                       <div style={{ 
                         position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                         background: '#e2e8f0', borderRadius: '2px', display: m.name.includes('White') ? 'block' : 'none'
                       }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: on ? '#14b8a6' : '#334155' }}>
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          CANVAS PRINT TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'Canvas Print' && (
        <>
          <div>
            <span style={LABEL()}>WRAP TYPE</span>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, 1fr)`, gap: '10px' }}>
              {WRAPS.map(w => {
                const on = selections.canvasWrap?.id === w.id;
                return (
                  <button key={w.id} onClick={() => onSelectionChange('canvasWrap', w)}
                    style={{ ...CARD_BASE, ...(on ? CARD_ACTIVE : {}), gap: '8px', padding: '16px 8px 14px' }}>
                    <div style={{
                      width: '56px', height: '44px', borderRadius: '4px',
                      background: '#e2e8f0', border: '1px solid #cbd5e1'
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: on ? '#14b8a6' : '#334155' }}>{w.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          PHOTO PRINT TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'Photo Print' && (
        <>
          <div>
            <span style={LABEL()}>PAPER TYPE</span>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, 1fr)`, gap: '10px' }}>
              {PAPERS.map(p => {
                const on = selections.paper?.id === p.id;
                return (
                  <button key={p.id} onClick={() => onSelectionChange('paper', p)}
                    style={{ ...CARD_BASE, ...(on ? CARD_ACTIVE : {}), gap: '8px', padding: '12px 6px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '6px',
                      background: '#f8fafc', border: '1px solid #e2e8f0'
                    }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: on ? '#14b8a6' : '#334155', textAlign: 'center' }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── ACTION BUTTONS ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '4px' }}>
        <button onClick={onAddToCart} disabled={isOutOfStock} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '14px 12px',
          background: isOutOfStock ? '#e2e8f0' : '#14b8a6',
          color: isOutOfStock ? '#94a3b8' : '#ffffff',
          border: 'none', borderRadius: '14px',
          fontSize: '15px', fontWeight: 700,
          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
        }}>
          <ShoppingBag size={18} />
          {addedToCart ? 'Added ✓' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <button onClick={() => {}} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '14px 12px',
          background: '#ffffff', color: '#334155',
          border: '1.5px solid #e2e8f0', borderRadius: '14px',
          fontSize: '15px', fontWeight: 600,
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}>
          <Bookmark size={18} />
          Save Project
        </button>
      </div>

    </div>
  );
}
