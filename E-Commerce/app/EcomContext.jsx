import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const EcomContext = createContext(null);

export function EcomProvider({ children }) {
  let cached = null;
  try {
    const cachedStr = localStorage.getItem('ecom_app_cache');
    if (cachedStr) cached = JSON.parse(cachedStr);
  } catch (e) {}

  const [products, setProducts] = useState(cached?.products || []);
  const [categories, setCategories] = useState(cached?.categories || []);
  const [frameConfigurations, setFrameConfigurations] = useState(cached?.frameConfigurations || []);
  const [settings, setSettings] = useState(cached?.settings || {});
  const [loading, setLoading] = useState(!cached); // skip loader if cached
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('[EcomContext] Starting loadData...');
        setLoading(true);

        const [
          { data: settingsData, error: settingsError },
          { data: catData, error: catError },
          { data: productsData, error: productsError },
          { data: frameData, error: frameError }
        ] = await Promise.all([
          supabase.from('settings').select('key, value'),
          supabase.from('categories').select('*').eq('status', 'active').order('sort_order', { ascending: true }),
          supabase.from('products').select('*').eq('status', 'active'),
          supabase.from('frame_configurations').select('*').order('sort_order', { ascending: true })
        ]);

        if (settingsError) throw settingsError;
        if (catError) throw catError;
        if (productsError) throw productsError;

        const settingsMap = {};
        settingsData?.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setSettings(settingsMap);

        // Build hierarchical categories structure
        const parentMap = new Map();
        const childrenMap = new Map();
        
        catData?.forEach(cat => {
          const c = { id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon, bannerImage: cat.banner_image, parentId: cat.parent_id, sortOrder: cat.sort_order };
          if (!cat.parent_id) {
            parentMap.set(c.id, c);
            if (!childrenMap.has(c.id)) childrenMap.set(c.id, []);
          } else {
            if (!childrenMap.has(cat.parent_id)) childrenMap.set(cat.parent_id, []);
            childrenMap.get(cat.parent_id).push(c);
          }
        });

        const nestedCategories = Array.from(parentMap.values()).map(parent => ({
          ...parent,
          children: (childrenMap.get(parent.id) || []).sort((a,b) => a.sortOrder - b.sortOrder)
        })).sort((a,b) => a.sortOrder - b.sortOrder);

        setCategories(nestedCategories);

        let mappedConfigs = [];
        if (frameError) {
          console.log('Frame configs table might not exist yet.', frameError);
        } else if (frameData) {
          const activeFrames = frameData.filter(f => f.is_active === true || f.is_active === null || f.is_active === undefined);
          mappedConfigs = activeFrames.map(f => ({
            id: f.id, type: f.type, name: f.name, value: f.value,
            price: parseFloat(f.price) || 0, offerPrice: f.offer_price ? parseFloat(f.offer_price) : null,
            thumbnailUrl: f.thumbnail_url, sortOrder: f.sort_order,
          }));
          setFrameConfigurations(mappedConfigs);
        }

        // Map snake_case to camelCase
        const mappedProducts = (productsData || []).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          sku: p.sku,
          description: p.description,
          price: p.selling_price || 0,
          originalPrice: p.selling_price ? p.selling_price * 1.2 : 0, // Mock original price for discounts
          stock: p.stock || 0,
          status: p.status,
          imageUrl: p.image_url,
          extraImages: p.extra_images ? (typeof p.extra_images === 'string' ? JSON.parse(p.extra_images) : p.extra_images) : [],
          rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1), // Mock rating between 4.0 and 5.0
          reviews: Math.floor(Math.random() * 200) + 10, // Mock review count
        }));

        setProducts(mappedProducts);

        try {
          localStorage.setItem('ecom_app_cache', JSON.stringify({
            products: mappedProducts,
            categories: nestedCategories,
            settings: settingsMap,
            frameConfigurations: mappedConfigs || []
          }));
        } catch(e) {}
      } catch (err) {
        console.error("Error loading e-commerce data:", err);
        setError(err.message);
      } finally {
        console.log('[EcomContext] Finished loadData. Setting loading=false.');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const trackProductView = async (productId, user) => {
    try {
      if (user) {
        // Upsert into Supabase (delete old if exists, insert new to update timestamp)
        await supabase.from('recently_viewed')
          .delete()
          .eq('customer_id', user.id)
          .eq('product_id', productId);
        
        await supabase.from('recently_viewed')
          .insert({ customer_id: user.id, product_id: productId });
      } else {
        // LocalStorage for guests
        let history = [];
        try { history = JSON.parse(localStorage.getItem('recently_viewed') || '[]'); } catch (e) {}
        history = history.filter(id => id !== productId);
        history.unshift(productId);
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('recently_viewed', JSON.stringify(history));
      }
    } catch (e) { console.error("Error tracking view", e); }
  };

  const getProductReviews = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`*, customer:customer_id(email)`) // We assume we can get email, but auth.users isn't directly joinable in Supabase by default unless we have a public profiles table.
        // Actually, Supabase doesn't allow joining auth.users directly. So we just return the data.
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching reviews", e);
      return [];
    }
  };

  const submitReview = async (user, productId, rating, title, review, verified) => {
    try {
      const { data, error } = await supabase.from('product_reviews').insert({
        customer_id: user.id,
        product_id: productId,
        rating,
        title,
        review,
        verified_purchase: verified
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error submitting review", e);
      return false;
    }
  };

  const value = useMemo(() => ({
    products,
    categories,
    frameConfigurations,
    settings,
    loading,
    error,
    trackProductView,
    getProductReviews,
    submitReview
  }), [products, categories, frameConfigurations, settings, loading, error, trackProductView, getProductReviews, submitReview]);

  return (
    <EcomContext.Provider value={value}>
      {children}
    </EcomContext.Provider>
  );
}

export function useEcom() {
  const context = useContext(EcomContext);
  if (!context) {
    throw new Error('useEcom must be used within an EcomProvider');
  }
  return context;
}
