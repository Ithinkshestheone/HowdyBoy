/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, ChevronLeft, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './data/games.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeGame, setActiveGame] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(gamesData.map(g => g.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveGame(null); setSelectedCategory('All'); setSearchQuery(''); }}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">NEXUS<span className="text-emerald-500">GAMES</span></h1>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="Search games by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-black/40" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6 flex items-center gap-2 text-black/40 text-sm font-medium">
            <Search className="w-4 h-4" />
            <span>Showing results for "<span className="text-black">{searchQuery}</span>"</span>
            <span className="ml-auto">{filteredGames.length} games found</span>
          </div>
        )}

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white text-black/60 hover:bg-black/5 border border-black/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div
                layout
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setActiveGame(game)}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Gamepad2 className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-black/60 border border-black/5">
                      {game.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-600 transition-colors">{game.title}</h3>
                  <p className="text-black/50 text-sm line-clamp-2 leading-relaxed">{game.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-black/40">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No games found matching your search.</p>
          </div>
        )}
      </main>

      {/* Game Player Modal */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveGame(null)}
                    className="p-2 hover:bg-black/5 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-bold text-lg leading-none mb-1">{activeGame.title}</h2>
                    <p className="text-xs text-black/40 font-medium uppercase tracking-wider">{activeGame.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(activeGame.iframeUrl, '_blank')}
                    className="p-2 hover:bg-black/5 rounded-xl transition-colors text-black/40 hover:text-black"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveGame(null)}
                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Game Container */}
              <div className="flex-1 bg-black relative">
                <iframe
                  src={activeGame.iframeUrl}
                  className="w-full h-full border-none"
                  title={activeGame.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-black/60">
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-4 h-4" />
                    <span>Full Screen Supported</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-black/30">
                  ID: {activeGame.id.toUpperCase()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">NEXUSGAMES</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-black/40">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-black/30">© 2024 Nexus Games. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
