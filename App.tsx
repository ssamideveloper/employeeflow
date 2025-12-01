import React from 'react';
import Layout from './components/Layout';

// Global styles for transitions
const App = () => {
  return (
    <>
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Layout />
    </>
  );
};

export default App;
