import React from 'react';
import TrustVerified from './TrustVerified';

/**
 * App.js — Root wrapper for TrustVerified PWA
 *
 * Keeps App.js slim; all application logic lives in TrustVerified.jsx.
 * Add global context providers (theme, auth, routing) here if you expand later.
 */
function App() {
  return <TrustVerified />;
}

export default App;
