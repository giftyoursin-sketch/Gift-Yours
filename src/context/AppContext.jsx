import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const AppContext = createContext(null);

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const today = () => format(new Date(), 'yyyy-MM-dd');

const safeParseJSON = (val) => {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch(e) { return []; }
  }
  return val || [];
};

// ─── DB ↔ JS Transforms ──────────────────────────────────────
// Products: snake_case DB → camelCase JS
const productFromDB = (p) => !p ? null : ({
  id: p.id, name: p.name, category: p.category, sku: p.sku,
  description: p.description, purchasePrice: p.purchase_price,
  sellingPrice: p.selling_price, stock: p.stock, minStock: p.min_stock,
  supplier: p.supplier, notes: p.notes, status: p.status,
  createdAt: p.created_at, updatedAt: p.updated_at,
});
const productToDB = (p) => ({
  id: p.id, name: p.name, category: p.category, sku: p.sku,
  description: p.description, purchase_price: p.purchasePrice || 0,
  selling_price: p.sellingPrice || 0, stock: p.stock || 0, min_stock: p.minStock || 5,
  supplier: p.supplier, notes: p.notes, status: p.status || 'active',
  updated_at: new Date().toISOString(),
});

// Sales: snake_case DB → camelCase JS
const saleFromDB = (s) => !s ? null : ({
  id: s.id, customerId: s.customer_id, customerName: s.customer_name,
  items: safeParseJSON(s.items), total: s.total, paymentMethod: s.payment_method,
  date: s.date, notes: s.notes, createdAt: s.created_at,
});
const saleToDB = (s) => ({
  id: s.id, customer_id: s.customerId, customer_name: s.customerName,
  items: s.items || [], total: s.total || 0, payment_method: s.paymentMethod || 'Cash',
  date: s.date, notes: s.notes, updated_at: new Date().toISOString(),
});

// Invoices
const invoiceFromDB = (i) => !i ? null : ({
  id: i.id, invoiceNumber: i.invoice_number, customerId: i.customer_id,
  customerName: i.customer_name, customerPhone: i.customer_phone,
  customerAddress: i.customer_address, date: i.date, dueDate: i.due_date,
  items: safeParseJSON(i.items), subtotal: i.subtotal, discount: i.discount,
  discountAmt: i.discount_amt, grandTotal: i.grand_total, status: i.status,
  paymentMethod: i.payment_method, notes: i.notes, terms: i.terms,
  createdAt: i.created_at,
});
const invoiceToDB = (i) => ({
  id: i.id, invoice_number: i.invoiceNumber, customer_id: i.customerId,
  customer_name: i.customerName, customer_phone: i.customerPhone,
  customer_address: i.customerAddress, date: i.date, due_date: i.dueDate,
  items: i.items || [], subtotal: i.subtotal || 0, discount: i.discount || 0,
  discount_amt: i.discountAmt || 0, grand_total: i.grandTotal || 0,
  status: i.status || 'pending', payment_method: i.paymentMethod || 'Cash',
  notes: i.notes, terms: i.terms, updated_at: new Date().toISOString(),
});

// Expenses
const expenseFromDB = (e) => !e ? null : ({
  id: e.id, title: e.title, amount: e.amount, category: e.category,
  date: e.date, description: e.description, paymentMethod: e.payment_method,
  createdAt: e.created_at,
});
const expenseToDB = (e) => ({
  id: e.id, title: e.title, amount: e.amount || 0, category: e.category,
  date: e.date, description: e.description, payment_method: e.paymentMethod || 'Cash',
  updated_at: new Date().toISOString(),
});

// Stock History
const stockHistoryFromDB = (h) => !h ? null : ({
  id: h.id, productId: h.product_id, productName: h.product_name,
  delta: h.delta, reason: h.reason, date: h.date, timestamp: h.timestamp,
});
const stockHistoryToDB = (h) => ({
  id: h.id, product_id: h.productId, product_name: h.productName,
  delta: h.delta, reason: h.reason, date: h.date,
});

// Customer passthrough (all fields match)
const customerFromDB = (c) => !c ? null : ({
  id: c.id, name: c.name, phone: c.phone, email: c.email,
  address: c.address, notes: c.notes, createdAt: c.created_at,
});
const customerToDB = (c) => ({
  id: c.id, name: c.name, phone: c.phone, email: c.email,
  address: c.address, notes: c.notes, updated_at: new Date().toISOString(),
});

// ─── State ───────────────────────────────────────────────────
const initialState = {
  products: [], customers: [], sales: [], invoices: [],
  expenses: [], stockHistory: [],
  settings: {
    businessName: 'Gift Yours', phone: '', address: '',
    invoicePrefix: 'INV', currency: '₹', theme: 'light', nextInvoiceNumber: 1,
  },
  notifications: [],
  loading: true,
  dbError: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ALL': return { ...state, ...action.payload, loading: false };
    case 'SET_PRODUCTS': return { ...state, products: action.payload };
    case 'SET_CUSTOMERS': return { ...state, customers: action.payload };
    case 'SET_SALES': return { ...state, sales: action.payload };
    case 'SET_INVOICES': return { ...state, invoices: action.payload };
    case 'SET_EXPENSES': return { ...state, expenses: action.payload };
    case 'SET_STOCK_HISTORY': return { ...state, stockHistory: action.payload };
    case 'SET_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 20) };
    case 'REMOVE_NOTIFICATION': return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'SET_DB_ERROR': return { ...state, dbError: true, loading: false };
    default: return state;
  }
}

// ─── Provider ────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      try {
        const [
          { data: products, error: e1 },
          { data: customers, error: e2 },
          { data: sales, error: e3 },
          { data: invoices, error: e4 },
          { data: expenses, error: e5 },
          { data: stockHistory, error: e6 },
          { data: settingsRows, error: e7 },
        ] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('sales').select('*').order('created_at', { ascending: false }),
          supabase.from('invoices').select('*').order('created_at', { ascending: false }),
          supabase.from('expenses').select('*').order('created_at', { ascending: false }),
          supabase.from('stock_history').select('*').order('timestamp', { ascending: false }),
          supabase.from('settings').select('*'),
        ]);

        if (e1 || e2 || e3 || e4 || e5 || e6) {
          console.error('Supabase load errors:', { e1, e2, e3, e4, e5, e6, e7 });
          dispatch({ type: 'SET_DB_ERROR' });
          return;
        }

        const settings = {};
        (settingsRows || []).forEach(s => { settings[s.key] = s.value; });

        dispatch({
          type: 'LOAD_ALL',
          payload: {
            products: (products || []).map(productFromDB),
            customers: (customers || []).map(customerFromDB),
            sales: (sales || []).map(saleFromDB),
            invoices: (invoices || []).map(invoiceFromDB),
            expenses: (expenses || []).map(expenseFromDB),
            stockHistory: (stockHistory || []).map(stockHistoryFromDB),
            settings: {
              ...initialState.settings,
              ...settings,
              nextInvoiceNumber: parseInt(settings.nextInvoiceNumber || '1'),
            },
          },
        });
      } catch (err) {
        console.error('Fatal load error:', err);
        dispatch({ type: 'SET_DB_ERROR' });
      }
    }
    loadAll();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'light');
  }, [state.settings.theme]);

  const notify = useCallback((message, type = 'info') => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateId(), message, type, timestamp: new Date().toISOString() } });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  // ─── PRODUCTS ────────────────────────────────────────────────
  const addProduct = useCallback(async (data) => {
    const product = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    const { error } = await supabase.from('products').insert([{ ...productToDB(product), created_at: product.createdAt }]);
    if (error) { notify('Failed to add product', 'error'); console.error(error); return; }
    const { data: all } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_PRODUCTS', payload: (all || []).map(productFromDB) });
    notify('Product added successfully', 'success');
    return product;
  }, [notify]);

  const updateProduct = useCallback(async (id, data) => {
    const existing = state.products.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    const { error } = await supabase.from('products').update(productToDB(updated)).eq('id', id);
    if (error) { notify('Failed to update product', 'error'); console.error(error); return; }
    const { data: all } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_PRODUCTS', payload: (all || []).map(productFromDB) });
    notify('Product updated', 'success');
  }, [state.products, notify]);

  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { notify('Failed to delete product', 'error'); return; }
    dispatch({ type: 'SET_PRODUCTS', payload: state.products.filter(p => p.id !== id) });
    notify('Product deleted', 'success');
  }, [state.products, notify]);

  const updateProductStock = useCallback(async (id, delta, reason = 'manual') => {
    const existing = state.products.find(p => p.id === id);
    if (!existing) return;
    const newStock = Math.max(0, (existing.stock || 0) + delta);
    const { error } = await supabase.from('products').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { console.error('Stock update error:', error); return; }

    // Record stock history
    const entry = { id: generateId(), productId: id, productName: existing.name, delta, reason, date: today() };
    await supabase.from('stock_history').insert([{ ...stockHistoryToDB(entry), timestamp: new Date().toISOString() }]);

    const [{ data: allProducts }, { data: allHistory }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('stock_history').select('*').order('timestamp', { ascending: false }),
    ]);
    dispatch({ type: 'SET_PRODUCTS', payload: (allProducts || []).map(productFromDB) });
    dispatch({ type: 'SET_STOCK_HISTORY', payload: (allHistory || []).map(stockHistoryFromDB) });
  }, [state.products]);

  // ─── CUSTOMERS ───────────────────────────────────────────────
  const addCustomer = useCallback(async (data) => {
    const customer = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    const { error } = await supabase.from('customers').insert([{ ...customerToDB(customer), created_at: customer.createdAt }]);
    if (error) { notify('Failed to add customer', 'error'); console.error(error); return; }
    const { data: all } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_CUSTOMERS', payload: (all || []).map(customerFromDB) });
    notify('Customer added', 'success');
    return customer;
  }, [notify]);

  const updateCustomer = useCallback(async (id, data) => {
    const existing = state.customers.find(c => c.id === id);
    if (!existing) return;
    const { error } = await supabase.from('customers').update(customerToDB({ ...existing, ...data })).eq('id', id);
    if (error) { notify('Failed to update customer', 'error'); return; }
    const { data: all } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_CUSTOMERS', payload: (all || []).map(customerFromDB) });
    notify('Customer updated', 'success');
  }, [state.customers, notify]);

  const deleteCustomer = useCallback(async (id) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) { notify('Failed to delete customer', 'error'); return; }
    dispatch({ type: 'SET_CUSTOMERS', payload: state.customers.filter(c => c.id !== id) });
    notify('Customer deleted', 'success');
  }, [state.customers, notify]);

  // ─── SALES ───────────────────────────────────────────────────
  const addSale = useCallback(async (data) => {
    const sale = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    const { error } = await supabase.from('sales').insert([{ ...saleToDB(sale), created_at: sale.createdAt }]);
    if (error) { notify('Failed to record sale', 'error'); console.error(error); return; }

    // Reduce stock for each item
    for (const item of sale.items || []) {
      await updateProductStock(item.productId, -item.qty, 'sale');
    }

    const { data: all } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_SALES', payload: (all || []).map(saleFromDB) });
    notify('Sale recorded', 'success');
    return sale;
  }, [updateProductStock, notify]);

  const updateSale = useCallback(async (id, data) => {
    const existing = state.sales.find(s => s.id === id);
    if (!existing) return;
    const { error } = await supabase.from('sales').update(saleToDB({ ...existing, ...data })).eq('id', id);
    if (error) { notify('Failed to update sale', 'error'); return; }
    const { data: all } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_SALES', payload: (all || []).map(saleFromDB) });
  }, [state.sales, notify]);

  const deleteSale = useCallback(async (id) => {
    const sale = state.sales.find(s => s.id === id);
    if (!sale) return;
    // Restore stock
    for (const item of sale.items || []) {
      await updateProductStock(item.productId, item.qty, 'refund');
    }
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) { notify('Failed to delete sale', 'error'); return; }
    dispatch({ type: 'SET_SALES', payload: state.sales.filter(s => s.id !== id) });
    notify('Sale deleted & stock restored', 'success');
  }, [state.sales, updateProductStock, notify]);

  // ─── INVOICES ────────────────────────────────────────────────
  const addInvoice = useCallback(async (data) => {
    const num = parseInt(state.settings.nextInvoiceNumber || 1);
    const invoice = {
      ...data,
      id: generateId(),
      invoiceNumber: `${state.settings.invoicePrefix || 'INV'}-${String(num).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };
    const { error } = await supabase.from('invoices').insert([{ ...invoiceToDB(invoice), created_at: invoice.createdAt }]);
    if (error) { notify('Failed to create invoice', 'error'); console.error(error); return; }

    // Increment invoice number
    const newNum = num + 1;
    await supabase.from('settings').upsert([{ key: 'nextInvoiceNumber', value: String(newNum) }]);
    dispatch({ type: 'SET_SETTINGS', payload: { nextInvoiceNumber: newNum } });

    const { data: all } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_INVOICES', payload: (all || []).map(invoiceFromDB) });
    
    // Auto-create Sale
    await addSale({
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      items: invoice.items,
      total: invoice.grandTotal,
      paymentMethod: invoice.paymentMethod,
      date: invoice.date,
      notes: `Generated from Invoice ${invoice.invoiceNumber}${invoice.notes ? ` - ${invoice.notes}` : ''}`
    });

    notify('Invoice created', 'success');
    return invoice;
  }, [state.settings, notify, addSale]);

  const updateInvoice = useCallback(async (id, data) => {
    const existing = state.invoices.find(i => i.id === id);
    if (!existing) return;
    const { error } = await supabase.from('invoices').update(invoiceToDB({ ...existing, ...data })).eq('id', id);
    if (error) { notify('Failed to update invoice', 'error'); return; }
    const { data: all } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_INVOICES', payload: (all || []).map(invoiceFromDB) });
    notify('Invoice updated', 'success');
  }, [state.invoices, notify]);

  const deleteInvoice = useCallback(async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) { notify('Failed to delete invoice', 'error'); return; }
    dispatch({ type: 'SET_INVOICES', payload: state.invoices.filter(i => i.id !== id) });
    notify('Invoice deleted', 'success');
  }, [state.invoices, notify]);

  // ─── EXPENSES ────────────────────────────────────────────────
  const addExpense = useCallback(async (data) => {
    const expense = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    const { error } = await supabase.from('expenses').insert([{ ...expenseToDB(expense), created_at: expense.createdAt }]);
    if (error) { notify('Failed to add expense', 'error'); console.error(error); return; }
    const { data: all } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_EXPENSES', payload: (all || []).map(expenseFromDB) });
    notify('Expense recorded', 'success');
    return expense;
  }, [notify]);

  const updateExpense = useCallback(async (id, data) => {
    const existing = state.expenses.find(e => e.id === id);
    if (!existing) return;
    const { error } = await supabase.from('expenses').update(expenseToDB({ ...existing, ...data })).eq('id', id);
    if (error) { notify('Failed to update expense', 'error'); return; }
    const { data: all } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    dispatch({ type: 'SET_EXPENSES', payload: (all || []).map(expenseFromDB) });
  }, [state.expenses, notify]);

  const deleteExpense = useCallback(async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { notify('Failed to delete expense', 'error'); return; }
    dispatch({ type: 'SET_EXPENSES', payload: state.expenses.filter(e => e.id !== id) });
    notify('Expense deleted', 'success');
  }, [state.expenses, notify]);

  // ─── SETTINGS ────────────────────────────────────────────────
  const saveSetting = useCallback(async (key, value) => {
    await supabase.from('settings').upsert([{ key, value: String(value) }]);
    dispatch({ type: 'SET_SETTINGS', payload: { [key]: value } });
  }, []);

  const saveSettings = useCallback(async (data) => {
    const rows = Object.entries(data).map(([key, value]) => ({ key, value: String(value) }));
    await supabase.from('settings').upsert(rows);
    dispatch({ type: 'SET_SETTINGS', payload: data });
    notify('Settings saved', 'success');
  }, [notify]);

  // ─── COMPUTED METRICS ────────────────────────────────────────
  const getMetrics = useCallback(() => {
    const todayStr = today();
    const todaySales = state.sales.filter(s => s.date === todayStr);
    const todayExpenses = state.expenses.filter(e => e.date === todayStr);
    const todayIncome = todaySales.reduce((a, s) => a + (s.total || 0), 0);
    const todayExpenseTotal = todayExpenses.reduce((a, e) => a + (e.amount || 0), 0);
    const todayProfit = todayIncome - todayExpenseTotal;

    const monthStr = todayStr.slice(0, 7);
    const monthSales = state.sales.filter(s => s.date?.startsWith(monthStr));
    const monthExpenses = state.expenses.filter(e => e.date?.startsWith(monthStr));
    const monthIncome = monthSales.reduce((a, s) => a + (s.total || 0), 0);
    const monthExpenseTotal = monthExpenses.reduce((a, e) => a + (e.amount || 0), 0);
    const monthProfit = monthIncome - monthExpenseTotal;

    const totalInventoryValue = state.products.reduce((a, p) => a + (p.stock || 0) * (p.purchasePrice || 0), 0);
    const lowStockProducts = state.products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
    const outOfStockProducts = state.products.filter(p => !p.stock || p.stock <= 0);

    return {
      todayIncome, todayExpenseTotal, todayProfit, todaySalesCount: todaySales.length,
      monthIncome, monthExpenseTotal, monthProfit, monthSalesCount: monthSales.length,
      totalInventoryValue, lowStockProducts, outOfStockProducts,
    };
  }, [state.sales, state.expenses, state.products]);

  const value = {
    ...state,
    // Products
    addProduct, updateProduct, deleteProduct, updateProductStock,
    // Customers
    addCustomer, updateCustomer, deleteCustomer,
    // Sales
    addSale, updateSale, deleteSale,
    // Invoices
    addInvoice, updateInvoice, deleteInvoice,
    // Expenses
    addExpense, updateExpense, deleteExpense,
    // Settings
    saveSetting, saveSettings,
    // Utils
    getMetrics, notify, removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
