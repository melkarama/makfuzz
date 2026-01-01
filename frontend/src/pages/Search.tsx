import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search as SearchIcon,
    Plus,
    Play,
    Settings2,
    Columns,
    AlertCircle,
    Upload
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import CriteriaRow from '../components/CriteriaRow';
import { api } from '../api';
import { FileInfo, SearchState, CriteriaInput, SearchResponse } from '../types';

interface SearchProps {
    fileInfo: FileInfo | null;
    searchState: SearchState;
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
    onSearchComplete: (results: SearchResponse) => void;
    onFileUploaded: (info: FileInfo) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Search({
    fileInfo,
    searchState,
    setSearchState,
    onSearchComplete,
    onFileUploaded
}: SearchProps) {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addCriteria = useCallback(() => {
        setSearchState(prev => ({
            ...prev,
            criterias: [...prev.criterias, {
                value: '',
                spellingWeight: 1,
                phoneticWeight: 1,
                minSpellingScore: 0,
                minPhoneticScore: 0,
                matchingType: 'SIMILARITY'
            }]
        }));
    }, [setSearchState]);

    const updateCriteria = useCallback((index: number, criteria: CriteriaInput) => {
        setSearchState(prev => ({
            ...prev,
            criterias: prev.criterias.map((c, i) => i === index ? criteria : c)
        }));
    }, [setSearchState]);

    const removeCriteria = useCallback((index: number) => {
        setSearchState(prev => ({
            ...prev,
            criterias: prev.criterias.filter((_, i) => i !== index)
        }));
    }, [setSearchState]);

    const toggleColumn = useCallback((index: number) => {
        setSearchState(prev => ({
            ...prev,
            searchColumnIndexes: prev.searchColumnIndexes.includes(index)
                ? prev.searchColumnIndexes.filter(i => i !== index)
                : [...prev.searchColumnIndexes, index].sort((a, b) => a - b)
        }));
    }, [setSearchState]);

    const handleSearch = useCallback(async () => {
        if (!fileInfo) {
            setError('Please upload a file first');
            return;
        }

        const validCriterias = searchState.criterias.filter(c => c.value.trim() !== '');
        if (validCriterias.length === 0) {
            setError('Please enter at least one search term');
            return;
        }

        if (searchState.searchColumnIndexes.length === 0) {
            setError('Please select at least one column to search');
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const results = await api.search(fileInfo.fileId, searchState);
            onSearchComplete(results);
            navigate('/results');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    }, [fileInfo, searchState, onSearchComplete, navigate]);

    if (!fileInfo) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Upload size={20} />
                                Upload a File First
                            </h3>
                        </div>
                        <div className="card-body">
                            <FileUpload onFileUploaded={onFileUploaded} />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Column Selection */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Columns size={20} />
                        Columns to Search
                    </h3>
                </div>
                <div className="card-body">
                    <p className="text-muted mb-md" style={{ fontSize: '0.9rem' }}>
                        Select which columns should be searched for matches
                    </p>
                    <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        {fileInfo.headers.map((header, index) => (
                            <motion.button
                                key={index}
                                className={`btn ${searchState.searchColumnIndexes.includes(index) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => toggleColumn(index)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ fontSize: '0.85rem' }}
                            >
                                {header}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Search Criteria */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <SearchIcon size={20} />
                        Search Criteria
                    </h3>
                    <motion.button
                        className="btn btn-secondary btn-sm"
                        onClick={addCriteria}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={16} />
                        Add Criteria
                    </motion.button>
                </div>
                <div className="card-body">
                    <AnimatePresence>
                        {searchState.criterias.map((criteria, index) => (
                            <CriteriaRow
                                key={index}
                                criteria={criteria}
                                index={index}
                                onChange={updateCriteria}
                                onRemove={removeCriteria}
                                canRemove={searchState.criterias.length > 1}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Search Settings */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Settings2 size={20} />
                        Search Settings
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid-4">
                        <div className="input-group">
                            <label className="input-label">Minimum Score Threshold</label>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    className="slider"
                                    min="0"
                                    max="100"
                                    value={searchState.threshold * 100}
                                    onChange={(e) => setSearchState(prev => ({
                                        ...prev,
                                        threshold: parseInt(e.target.value) / 100
                                    }))}
                                />
                                <div className="slider-value">{Math.round(searchState.threshold * 100)}%</div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Max Results</label>
                            <input
                                type="number"
                                className="input"
                                min="1"
                                max="10000"
                                value={searchState.topN}
                                onChange={(e) => setSearchState(prev => ({
                                    ...prev,
                                    topN: parseInt(e.target.value) || 100
                                }))}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Language</label>
                            <select
                                className="input select"
                                value={searchState.language}
                                onChange={(e) => setSearchState(prev => ({
                                    ...prev,
                                    language: e.target.value as 'en' | 'fr'
                                }))}
                            >
                                <option value="en">English (Generic Phonetic)</option>
                                <option value="fr">French (French Soundex)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="card mb-lg"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <div className="card-body flex items-center gap-md">
                            <AlertCircle size={20} style={{ color: 'var(--danger-500)' }} />
                            <span style={{ color: 'var(--danger-500)' }}>{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Button */}
            <motion.div variants={itemVariants}>
                <motion.button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleSearch}
                    disabled={isSearching}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ position: 'relative' }}
                >
                    {isSearching ? (
                        <>
                            <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            Run Fuzzy Search
                        </>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
