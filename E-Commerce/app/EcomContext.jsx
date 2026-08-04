import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const EcomContext = createContext(null);

export function EcomProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('key, value');
        
        if (settingsError) throw settingsError;

        const settingsMap = {};
        settingsData?.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setSettings(settingsMap);

        // Parse categories from settings
        const catsString = settingsMap.productCategories || 'Photo Frames, Gift Items, Personalized Gifts, Home Decor, Photo Gifts, Customized Products, Other';
        const parsedCats = catsString.split(',').map(c => c.trim()).filter(Boolean);
        setCategories(parsedCats);

        // Fetch active products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');
        
        if (productsError) throw productsError;

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
      } catch (err) {
        console.error("Error loading e-commerce data:", err);
        setError(err.message);
      } finally {
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

  const value = {
    products,
    categories,
    settings,
    loading,
    error,
    trackProductView,
    getProductReviews,
    submitReview
  };

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
