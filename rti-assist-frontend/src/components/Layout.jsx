import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* SaaS Sticky Navbar */}
      <Navbar />

      {/* Main Content Area */}
      {isHomePage ? (
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Outlet />
        </main>
      )}

      {/* Modern SaaS Footer */}
      <Footer />
    </div>
  );
};
