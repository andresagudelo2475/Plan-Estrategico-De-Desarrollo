"use client";

import React from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="app-container">
          <main className="content">
            {children}
          </main>

          <footer className="main-footer">
            <div className="footer-label">REPORTING</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
