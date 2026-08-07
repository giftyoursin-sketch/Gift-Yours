import React, { useState, useEffect } from 'react';
import CustomizerPreview from './CustomizerPreview';
import Customizer3DView from './Customizer3DView';
import CustomizerControls from './CustomizerControls';
import PhotoEditorModal from './PhotoEditorModal';
import { useEcom } from '../../app/EcomContext';

export default function PhotoFrameCustomizer({ 
  product, 
  onAddToCart, 
  addedToCart,
  isOutOfStock
}) {
  const [image, setImage] = useState(null); 
  const [croppedImage, setCroppedImage] = useState(null); 
  const [viewMode, setViewMode] = useState('2D'); 
  const [showEditor, setShowEditor] = useState(false);
  
  const initialTab = product?.name?.toLowerCase().includes('canvas') ? 'Canvas Print' : 
                     product?.name?.toLowerCase().includes('print') ? 'Photo Print' : 'Photo Frame';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Extract size from product name (e.g., "Frame 12x8" -> w:12, h:8)
  const [parsedSize, setParsedSize] = useState({ w: '8', h: '8', name: '8 x 8 Inch' });

  useEffect(() => {
    if (product?.name) {
      const match = product.name.match(/(\d+)\s*[xX×]\s*(\d+)/);
      if (match) {
        setParsedSize({
          w: match[1],
          h: match[2],
          name: `${match[1]} x ${match[2]} Inch`
        });
      }
    }
  }, [product?.name]);

  const [selections, setSelections] = useState({
    size: null, 
    color: { id: 'c1', name: 'Natural Oak', value: '#c8a06b' }, 
    margin: { id: 'm1', name: 'White Margin' },
    paper: { id: 'p1', name: 'Matte' }, 
    canvasWrap: { id: 'w1', name: 'Gallery Wrap' }, 
    thickness: null,
  });

  // Extract all available sizes from all frame products in the database
  const { products } = useEcom();
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    if (!products) return;
    const sizes = new Set();
    products.forEach(p => {
      // Look for products that seem to be frames or prints
      if (p.name && (p.name.toLowerCase().includes('frame') || p.category?.toLowerCase() === 'frames')) {
        const match = p.name.match(/(\d+)\s*[xX×]\s*(\d+)/);
        if (match) {
          sizes.add(`${match[1]} x ${match[2]}`);
        }
      }
    });
    // Add current parsed size as well just in case
    if (parsedSize.w && parsedSize.h) sizes.add(`${parsedSize.w} x ${parsedSize.h}`);
    
    // Sort sizes logically based on width
    setAvailableSizes(Array.from(sizes).sort((a, b) => parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0])));
  }, [products, parsedSize.w, parsedSize.h]);

  useEffect(() => {
    // Keep size selection synced with parsed product size
    setSelections(prev => ({
      ...prev,
      size: { id: 's1', name: parsedSize.name, pW: parsedSize.w, pH: parsedSize.h, price: 0 }
    }));
  }, [parsedSize]);

  // Find if there's a specific product in the DB for the currently selected size to get its exact price
  const matchedProduct = React.useMemo(() => {
    if (!products || !products.length) return null;
    return products.find(p => {
      if (p.name && (p.name.toLowerCase().includes('frame') || p.category?.toLowerCase() === 'frames')) {
        const match = p.name.match(/(\d+)\s*[xX×]\s*(\d+)/);
        if (match) {
          return (match[1] === parsedSize.w && match[2] === parsedSize.h) ||
                 (match[1] === parsedSize.h && match[2] === parsedSize.w);
        }
      }
      return false;
    });
  }, [products, parsedSize.w, parsedSize.h]);

  // Use the matched product's price, or fallback to the current product's price
  const totalPrice = matchedProduct ? (matchedProduct.price || 0) : (product?.price || 0);

  const handleSelectionChange = (type, value) => {
    setSelections(prev => ({ ...prev, [type]: value }));
  };

  const handleAddToCart = () => {
    const parts = [activeTab, selections.size?.name];
    if (activeTab === 'Photo Frame') {
      parts.push(selections.color?.name, selections.margin?.name);
    } else if (activeTab === 'Canvas Print') {
      parts.push(selections.canvasWrap?.name);
    } else if (activeTab === 'Photo Print') {
      parts.push(selections.paper?.name);
    }
    const variantName = parts.filter(Boolean).join(' | ');
    onAddToCart(totalPrice, variantName, { image: croppedImage || image, activeTab, selections, matchedProduct });
  };

  const handleImageUpload = (img) => {
    setImage(img);
    setShowEditor(true);
  };

  // Aspect ratio for editor
  const editorAspect = (parseFloat(parsedSize.w) || 8) / (parseFloat(parsedSize.h) || 8);

  return (
    <div className="customizer-flex-container">
      
      {showEditor && image && (
        <PhotoEditorModal 
          image={image}
          aspect={editorAspect}
          onSave={(cropped) => { setCroppedImage(cropped); setShowEditor(false); }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Left: Frame Preview */}
      {viewMode === '2D' ? (
        <CustomizerPreview 
          image={croppedImage || image}
          onImageUpload={handleImageUpload}
          onImageRemove={() => { setImage(null); setCroppedImage(null); }}
          onEditRequest={() => image && setShowEditor(true)}
          frameSize={selections.size}
          frameColor={selections.color}
          marginType={selections.margin}
          frameThickness={selections.thickness}
          viewMode={viewMode}
          onToggleView={() => setViewMode('3D')}
        />
      ) : (
        <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '560px' }}>
            <Customizer3DView 
              image={croppedImage || image}
              frameSize={selections.size}
              frameColor={selections.color}
              marginType={selections.margin}
              frameThickness={selections.thickness}
            />
          </div>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setViewMode('2D'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', color: '#14b8a6', border: '1.5px solid #14b8a6', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginTop: '2rem' }}
          >
            ← Back to 2D
          </button>
        </div>
      )}

      {/* Right: Controls */}
      <CustomizerControls 
        product={product}
        parsedSize={parsedSize}
        availableSizes={availableSizes}
        selections={selections}
        onSelectionChange={handleSelectionChange}
        onSizeChange={(w, h) => setParsedSize({ w, h, name: `${w} x ${h} Inch` })}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalPrice={totalPrice}
        onAddToCart={handleAddToCart}
        addedToCart={addedToCart}
        isOutOfStock={isOutOfStock}
      />
    </div>
  );
}
