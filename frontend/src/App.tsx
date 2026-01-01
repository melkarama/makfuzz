import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FuzzExplorer from './pages/FuzzExplorer';
import { api } from './api';
import { FileInfo, SearchState } from './types';

function App() {
    const navigate = useNavigate();
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

    const handleSearch = useCallback(async (currentState?: SearchState, fileIdOverride?: string) => {
        const id = fileIdOverride || fileInfo?.fileId;
        if (!id) return;

        const stateToUse = currentState || searchState;
        const validCriterias = stateToUse.criterias.filter(c => c.value.trim() !== '');
        if (validCriterias.length === 0 || stateToUse.searchColumnIndexes.length === 0) return;

        setIsSearching(true);
        try {
            const results = await api.search(id, stateToUse);
            setSearchResults(results);
            // Don't toast for every auto-debounce search, but maybe for manual ones or file changes
        } catch (err: any) {
            console.error('Search failed:', err);
            const message = err.response?.data?.message || 'Search failed. Please check your criteria.';
            toast.error(message);
        } finally {
            setIsSearching(false);
        }
    }, [fileInfo, searchState]);

    const handleFileUploaded = useCallback((info: FileInfo) => {
        setFileInfo(info);
        // Auto-select all columns by default
        const newState = {
            ...searchState,
            searchColumnIndexes: info.headers.map((_, i) => i)
        };
        setSearchState(newState);

        // Auto-reexecute search if we have valid criteria
        if (newState.criterias.some(c => c.value.trim() !== '')) {
            handleSearch(newState, info.fileId);
        }
    }, [searchState, handleSearch]);

    return (
        <div className="app-shell">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--bg-glass-heavy)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-light)',
                        backdropFilter: 'blur(12px)',
                        fontSize: '0.9rem',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        boxShadow: 'var(--shadow-lg)'
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--success-500)',
                            secondary: 'white',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--danger-500)',
                            secondary: 'white',
                        },
                    },
                }}
            />
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
                                    <FuzzExplorer
                                        fileInfo={fileInfo}
                                        searchResults={searchResults}
                                        searchState={searchState}
                                        setSearchState={setSearchState}
                                        onRefresh={handleSearch}
                                        isSearching={isSearching}
                                        onFileUploaded={handleFileUploaded}
                                    />
                                }
                            />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
