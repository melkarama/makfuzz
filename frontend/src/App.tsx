import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Results from './pages/Results';
import Settings from './pages/Settings';
import { api } from './api';
import { FileInfo, SearchState } from './types';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [searchState, setSearchState] = useState<SearchState>({
        criterias: [{ value: '', spellingWeight: 1, phoneticWeight: 1, minSpellingScore: 0, minPhoneticScore: 0, matchingType: 'SIMILARITY' }],
        searchColumnIndexes: [],
        threshold: 0.75,
        topN: 100000,
        language: 'en'
    });
    const [searchResults, setSearchResults] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async (currentState?: SearchState) => {
        if (!fileInfo) return;

        const stateToUse = currentState || searchState;
        const validCriterias = stateToUse.criterias.filter(c => c.value.trim() !== '');
        if (validCriterias.length === 0 || stateToUse.searchColumnIndexes.length === 0) return;

        setIsSearching(true);
        try {
            const results = await api.search(fileInfo.fileId, stateToUse);
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    }, [fileInfo, searchState]);

    const handleFileUploaded = useCallback((info: FileInfo) => {
        setFileInfo(info);
        // Auto-select all columns by default
        setSearchState(prev => ({
            ...prev,
            searchColumnIndexes: info.headers.map((_, i) => i)
        }));
    }, []);

    const handleSearchComplete = useCallback((results: any) => {
        setSearchResults(results);
    }, []);

    return (
        <BrowserRouter>
            <div className="app-shell">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

                <main className="main-content">
                    <Header
                        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                        fileInfo={fileInfo}
                    />

                    <div className="page-container">
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <Dashboard
                                            fileInfo={fileInfo}
                                            searchResults={searchResults}
                                            onFileUploaded={handleFileUploaded}
                                        />
                                    }
                                />
                                <Route
                                    path="/search"
                                    element={
                                        <Search
                                            fileInfo={fileInfo}
                                            searchState={searchState}
                                            setSearchState={setSearchState}
                                            onSearchComplete={handleSearchComplete}
                                            onFileUploaded={handleFileUploaded}
                                            isSearchingIn={isSearching}
                                            onSearchStart={handleSearch}
                                        />
                                    }
                                />
                                <Route
                                    path="/results"
                                    element={
                                        <Results
                                            fileInfo={fileInfo}
                                            searchResults={searchResults}
                                            searchState={searchState}
                                            setSearchState={setSearchState}
                                            onRefresh={handleSearch}
                                            isSearching={isSearching}
                                        />
                                    }
                                />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
