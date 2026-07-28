import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@supabaseClient';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist
  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      if (user) {
        // Fetch from DB
        const { data, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('customer_id', user.id);
        
        if (!error && data) {
          const dbWishlist = data.map(row => row.product_id);
          
          // Merge local wishlist if any
          const localStr = localStorage.getItem('guest_wishlist');
          if (localStr) {
            try {
              const localWishlist = JSON.parse(localStr);
              const newItems = localWishlist.filter(id => !dbWishlist.includes(id));
              
              if (newItems.length > 0) {
                const inserts = newItems.map(id => ({ customer_id: user.id, product_id: id }));
                await supabase.from('wishlist').insert(inserts);
                dbWishlist.push(...newItems);
              }
              // Clear local
              localStorage.removeItem('guest_wishlist');
            } catch (e) {}
          }
          
          setWishlist(dbWishlist);
        }
      } else {
        // Fetch from LocalStorage
        try {
          const localStr = localStorage.getItem('guest_wishlist');
          if (localStr) setWishlist(JSON.parse(localStr));
          else setWishlist([]);
        } catch (e) {
          setWishlist([]);
        }
      }
      setLoading(false);
    }
    
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    const isSaved = wishlist.includes(productId);
    let newWishlist;
    
    if (isSaved) {
      newWishlist = wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    
    setWishlist(newWishlist);
    
    if (user) {
      if (isSaved) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('customer_id', user.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('wishlist')
          .insert([{ customer_id: user.id, product_id: productId }]);
      }
    } else {
      localStorage.setItem('guest_wishlist', JSON.stringify(newWishlist));
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const clearWishlist = async () => {
    setWishlist([]);
    if (user) {
      await supabase.from('wishlist').delete().eq('customer_id', user.id);
    } else {
      localStorage.removeItem('guest_wishlist');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    return { wishlist: [], loading: false, toggleWishlist: () => {}, isInWishlist: () => false, clearWishlist: () => {} };
  }
  return context;
};
