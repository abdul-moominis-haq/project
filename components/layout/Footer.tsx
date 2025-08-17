'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-green-800">SmartAgri</span>
          </div>
          
          <div className="text-sm text-gray-600 text-center md:text-right">
            <p>© {new Date().getFullYear()} SmartAgri. All rights reserved.</p>
            <p className="mt-1">Smart Farming Management System</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
