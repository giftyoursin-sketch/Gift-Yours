import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import ToastContainer from '../ui/ToastContainer';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="mobile-only"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,46,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="desktop-only">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile sidebar (slide-in) */}
      <div
        className="mobile-only"
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
          transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar onMenuToggle={() => setMobileSidebarOpen(o => !o)} />

        <main
          style={{
            flex: 1, overflowY: 'auto',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
          }}
          className="main-content"
        >
          <Outlet />
        </main>
      </div>

      <BottomNav />
      <ToastContainer />
    </div>
  );
}
