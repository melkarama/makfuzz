import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Download,
    FileSpreadsheet,
    FileSearch,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    BarChart3,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    Percent,
    ChevronsRight,
    Settings,
    X,
    Plus,
    Filter,
    Columns,
    Upload
} from 'lucide-react';
import ResultsTable from '../components/ResultsTable';
import CriteriaRow from '../components/CriteriaRow';
import FileUpload from '../components/FileUpload';
import { api } from '../api';
import { FileInfo, SearchResponse, SearchState, CriteriaInput } from '../types';

interface FuzzExplorerProps {
    fileInfo: FileInfo | null;
    searchResults: SearchResponse | null;
    searchState: SearchState;
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
    onRefresh: (state?: SearchState) => void;
    isSearching: boolean;
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

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
};

function formatPercent(value: number): string {
    return (value * 100).toFixed(2) + '%';
}

interface PaginationControlsProps {
    localThreshold: string;
    setLocalThreshold: (val: string) => void;
    searchState: SearchState;
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
    onRefresh: (state?: SearchState) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    showSettings?: boolean;
}

const PaginationControls = ({
    localThreshold,
    setLocalThreshold,
    searchState,
    setSearchState,
    onRefresh,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
    showSettings = true
}: PaginationControlsProps) => {
    const isKeyDown = useRef(false);

    return (
        <div className="flex items-center gap-lg">
            {showSettings && (
                <>
                    {/* Global Threshold */}
                    <div className="flex items-center gap-xs">
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Threshold:</span>
                        <div className="flex items-center gap-xs">
                            <input
                                type="number"
                                className="input py-xs"
                                style={{ width: '70px', textAlign: 'center', fontSize: '0.85rem' }}
                                min="0"
                                max="100"
                                step="5"
                                value={localThreshold}
                                onKeyDown={(e) => {
                                    isKeyDown.current = true;
                                    if (e.key === 'Enter') {
                                        const val = parseInt(localThreshold);
                                        if (!isNaN(val)) {
                                            const clamped = Math.max(0, Math.min(100, val));
                                            const newVal = clamped / 100;
                                            const newState = { ...searchState, threshold: newVal };
                                            setSearchState(newState);
                                            onRefresh(newState);
                                        }
                                    }
                                }}
                                onKeyUp={() => {
                                    isKeyDown.current = false;
                                }}
                                onChange={(e) => {
                                    setLocalThreshold(e.target.value);
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) {
                                        const clamped = Math.max(0, Math.min(100, val));
                                        const newVal = clamped / 100;
                                        setSearchState(prev => ({ ...prev, threshold: newVal }));

                                        // If mouse click (arrows), refresh immediately
                                        if (!isKeyDown.current) {
                                            const newState = { ...searchState, threshold: newVal };
                                            onRefresh(newState);
                                        }
                                    }
                                }}
                            />
                            <span className="font-bold" style={{ fontSize: '0.85rem' }}>%</span>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="flex items-center gap-xs">
                        <select
                            className="input select py-xs"
                            style={{ width: 'auto', paddingRight: '28px', fontSize: '0.85rem', backgroundPosition: 'right 8px center' }}
                            value={searchState.language}
                            onChange={(e) => {
                                const newLang = e.target.value as 'en' | 'fr';
                                const newState = { ...searchState, language: newLang };
                                setSearchState(newState);
                                onRefresh(newState);
                            }}
                        >
                            <option value="en">EN</option>
                            <option value="fr">FR</option>
                        </select>
                    </div>
                </>
            )}

            <div className="flex items-center gap-sm">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Page Size:</span>
                <select
                    className="input select py-xs"
                    style={{ width: 'auto', paddingRight: '30px' }}
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={10}>10</option>
                    <option value={100}>100</option>
                    <option value={1000}>1000</option>
                    <option value={10000}>10000</option>
                </select>
            </div>

            <div className="flex items-center gap-xs">
                <button
                    className="btn btn-ghost btn-icon btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    className="btn btn-ghost btn-icon btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-xs px-md">
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Page</span>
                    <input
                        type="number"
                        className="input py-xs no-spinners"
                        style={{ width: '60px', textAlign: 'center' }}
                        min={1}
                        max={totalPages}
                        defaultValue={currentPage}
                        key={`page-input-${currentPage}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = parseInt((e.target as HTMLInputElement).value);
                                if (val >= 1 && val <= totalPages) setCurrentPage(val);
                            }
                        }}
                    />
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>of {totalPages}</span>
                </div>

                <button
                    className="btn btn-ghost btn-icon btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    className="btn btn-ghost btn-icon btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default function FuzzExplorer({
    fileInfo,
    searchResults,
    searchState,
    setSearchState,
    onRefresh,
    isSearching,
    onFileUploaded
}: FuzzExplorerProps) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showQuickEdit, setShowQuickEdit] = useState(!searchResults);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const debounceTimer = useRef<any>();

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    // Adjust currentPage if it's beyond the new maximum page count after a refresh
    useEffect(() => {
        if (searchResults) {
            const maxPage = Math.max(1, Math.ceil(searchResults.results.length / pageSize));
            if (currentPage > maxPage) {
                setCurrentPage(maxPage);
            }
        }
    }, [searchResults, pageSize, currentPage]);

    const validateRegex = useCallback((state: SearchState) => {
        for (const c of state.criterias) {
            if (c.matchingType === 'REGEX' && c.value.trim() !== '') {
                try {
                    new RegExp(c.value);
                } catch (e) {
                    toast.error(`Invalid Regex: "${c.value}"`);
                    return false;
                }
            }
        }
        return true;
    }, []);

    const handleRefresh = useCallback((state?: SearchState) => {
        const stateToUse = state || searchState;
        if (validateRegex(stateToUse)) {
            onRefresh(stateToUse);
        }
    }, [onRefresh, searchState, validateRegex]);

    const onCriteriaChange = useCallback((index: number, criteria: CriteriaInput, shouldRefresh = false) => {
        setSearchState(prev => {
            const newCriterias = [...prev.criterias];
            newCriterias[index] = criteria;
            const newState = { ...prev, criterias: newCriterias };
            if (shouldRefresh) {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                debounceTimer.current = setTimeout(() => {
                    handleRefresh(newState);
                }, 400);
            }
            return newState;
        });
    }, [setSearchState, handleRefresh]);

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

    const removeCriteria = useCallback((index: number) => {
        setSearchState(prev => {
            let newCriterias = prev.criterias.filter((_, i) => i !== index);
            if (newCriterias.length === 0) {
                newCriterias = [{
                    value: '',
                    spellingWeight: 1,
                    phoneticWeight: 1,
                    minSpellingScore: 0,
                    minPhoneticScore: 0,
                    matchingType: 'SIMILARITY'
                }];
            }
            const newState = { ...prev, criterias: newCriterias };
            onRefresh(newState);
            return newState;
        });
    }, [setSearchState, onRefresh]);
    const toggleColumn = useCallback((index: number) => {
        setSearchState(prev => {
            const isIncluded = prev.searchColumnIndexes.includes(index);
            const newIndexes = isIncluded
                ? prev.searchColumnIndexes.filter(i => i !== index)
                : [...prev.searchColumnIndexes, index].sort((a, b) => a - b);

            const newState = { ...prev, searchColumnIndexes: newIndexes };
            onRefresh(newState);
            return newState;
        });
    }, [setSearchState, onRefresh]);
    const handleExport = useCallback(async () => {
        if (!fileInfo || !searchState) return;

        try {
            const blob = await api.exportCSV(fileInfo.fileId, searchState);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'makfuzz_results.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('CSV exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export CSV');
        }
    }, [fileInfo, searchState]);

    const handleExportExcel = useCallback(async () => {
        if (!fileInfo || !searchState) return;

        try {
            const blob = await api.exportExcel(fileInfo.fileId, searchState);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'makfuzz_results.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export Excel');
        }
    }, [fileInfo, searchState]);

    const activeCriteriasCount = searchState.criterias.filter(c => c.value.trim() !== '').length;

    const totalPages = searchResults ? Math.ceil(searchResults.results.length / pageSize) : 0;

    const paginatedResults = useMemo(() => {
        if (!searchResults) return [];
        const start = (currentPage - 1) * pageSize;
        return searchResults.results.slice(start, start + pageSize);
    }, [searchResults, currentPage, pageSize]);

    const [localThreshold, setLocalThreshold] = useState(Math.round(searchState.threshold * 100).toString());

    useEffect(() => {
        setLocalThreshold(Math.round(searchState.threshold * 100).toString());
    }, [searchState.threshold]);

    // If no file is uploaded, show a different empty state
    if (!fileInfo) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <motion.button
                    variants={itemVariants}
                    className="empty-state"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                    onClick={() => setShowUploadModal(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="empty-state-icon">
                        <Upload size={80} />
                    </div>
                    <h2 className="empty-state-title">No Data Loaded</h2>
                    <p className="empty-state-text mb-lg">
                        Click anywhere to upload a CSV file and start exploring.
                    </p>
                    <div className="badge badge-primary">Click to begin</div>
                </motion.button>

                {/* Floating Upload Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="card"
                                style={{
                                    width: '90%',
                                    maxWidth: '550px',
                                    padding: 'var(--space-xl)',
                                    boxShadow: 'var(--shadow-2xl)',
                                    background: 'var(--bg-glass-heavy)',
                                    border: '1px solid var(--border-light)'
                                }}
                            >
                                <div className="flex justify-between items-center mb-xl">
                                    <div className="flex items-center gap-md">
                                        <div className="stat-icon primary" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }}>
                                            <Upload size={20} />
                                        </div>
                                        <div>
                                            <h3 className="card-title" style={{ margin: 0 }}>Replace Source File</h3>
                                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Upload a new CSV to match with current criteria</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        style={{ width: 32, height: 32 }}
                                        onClick={() => setShowUploadModal(false)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="card-body" style={{ padding: 0 }}>
                                    <FileUpload
                                        onFileUploaded={(info) => {
                                            onFileUploaded(info);
                                            setShowUploadModal(false);
                                        }}
                                        currentFile={null}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }



    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Replace File Modal (for when header button is clicked) */}
            <AnimatePresence>
                {showUploadModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="card"
                            style={{
                                width: '90%',
                                maxWidth: '550px',
                                padding: 'var(--space-xl)',
                                boxShadow: 'var(--shadow-2xl)',
                                background: 'var(--bg-glass-heavy)',
                                border: '1px solid var(--border-light)'
                            }}
                        >
                            <div className="flex justify-between items-center mb-xl">
                                <div className="flex items-center gap-md">
                                    <div className="stat-icon primary" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }}>
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <h3 className="card-title" style={{ margin: 0 }}>Replace Source File</h3>
                                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Current: {fileInfo.fileName}</p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    style={{ width: 32, height: 32 }}
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <FileUpload
                                    onFileUploaded={(info) => {
                                        onFileUploaded(info);
                                        setShowUploadModal(false);
                                    }}
                                    currentFile={null}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header Actions */}
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-lg">
                <div className="flex items-center gap-md">
                    <h2>Fuzz Explorer</h2>
                    <div className="badge badge-primary">{fileInfo.fileName}</div>
                </div>

                <div className="flex items-center gap-md">
                    <motion.button
                        className="btn btn-ghost"
                        onClick={() => setShowUploadModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Upload size={18} />
                        Replace File
                    </motion.button>

                    <motion.button
                        className="btn btn-ghost"
                        style={{
                            background: showQuickEdit ? 'var(--bg-glass-strong)' : 'transparent',
                            borderColor: showQuickEdit ? 'var(--primary-500)' : 'transparent',
                            color: showQuickEdit ? 'var(--primary-300)' : 'inherit'
                        }}
                        onClick={() => setShowQuickEdit(!showQuickEdit)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Settings size={18} />
                        {showQuickEdit ? 'Hide Tools' : 'Configure Search'}
                    </motion.button>

                    <motion.button
                        className="btn btn-secondary"
                        onClick={handleExport}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Download size={18} />
                        Export CSV
                    </motion.button>

                    <motion.button
                        className="btn btn-primary"
                        onClick={handleExportExcel}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FileSpreadsheet size={18} />
                        Export Excel
                    </motion.button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showQuickEdit && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="card overflow-hidden"
                    >
                        <div className="card-header flex justify-between items-center" style={{ background: 'var(--bg-glass-strong)' }}>
                            <h3 className="card-title">
                                <Settings size={20} />
                                Configuration
                            </h3>
                            <div className="flex items-center gap-sm">
                                <motion.button
                                    className={`btn btn-primary btn-sm overflow-hidden ${isSearching ? 'searching-pulse' : ''}`}
                                    onClick={() => handleRefresh()}
                                    disabled={isSearching}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ position: 'relative' }}
                                >
                                    {isSearching && <div className="loading-progress-bar" style={{ height: '100%', opacity: 0.2 }} />}
                                    <div className="flex items-center gap-xs relative z-10">
                                        {isSearching ? (
                                            <>
                                                <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Filter size={16} />
                                                Run Search
                                            </>
                                        )}
                                    </div>
                                </motion.button>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowQuickEdit(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="flex flex-col gap-md">
                                {/* Quick Column Selection */}
                                <div className="mb-md pb-md border-b border-subtle">
                                    <div className="flex items-center gap-sm mb-sm text-muted" style={{ fontSize: '0.9rem' }}>
                                        <Columns size={16} />
                                        <span>Columns to Search:</span>
                                    </div>
                                    <div className="flex gap-xs flex-wrap">
                                        {fileInfo?.headers.map((header, index) => (
                                            <button
                                                key={index}
                                                className={`btn btn-sm ${searchState.searchColumnIndexes.includes(index) ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => toggleColumn(index)}
                                                style={{ fontSize: '0.75rem', padding: 'var(--space-xs) var(--space-sm)' }}
                                            >
                                                {header}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {searchState.criterias.map((criteria, index) => (
                                    <CriteriaRow
                                        key={index}
                                        criteria={criteria}
                                        index={index}
                                        onChange={onCriteriaChange}
                                        onRemove={removeCriteria}
                                        canRemove={true}
                                        onSearch={() => handleRefresh()}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-start mt-md">
                                <motion.button
                                    className="btn btn-ghost btn-sm"
                                    onClick={addCriteria}
                                    whileHover={{ x: 5 }}
                                >
                                    <Plus size={16} />
                                    Add Another Criterion
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="stats-grid mb-lg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Target size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{searchResults?.totalFound.toLocaleString() || 0}</div>
                        <div className="stat-label">Matches</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{searchResults?.totalResults.toLocaleString() || fileInfo.totalRows.toLocaleString()}</div>
                        <div className="stat-label">Total Records</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon primary" style={{ background: 'rgba(138, 100, 255, 0.1)', color: 'var(--primary-300)' }}>
                        <Percent size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                            {searchResults && searchResults.totalResults > 0
                                ? ((searchResults.totalFound / searchResults.totalResults) * 100).toFixed(1)
                                : 0}%
                        </div>
                        <div className="stat-label">Match Rate</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{searchResults ? formatPercent(searchResults.maxAboveThreshold) : '0%'}</div>
                        <div className="stat-label">Best Match</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-500)' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{searchResults ? formatPercent(searchResults.minAboveThreshold) : '0%'}</div>
                        <div className="stat-label">Min Match</div>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(138, 100, 255, 0.15)', color: 'var(--primary-400)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{searchResults?.searchTimeMs || 0}ms</div>
                        <div className="stat-label">Time</div>
                    </div>
                </div>
            </motion.div>

            {/* Results Table Section */}
            <motion.div variants={itemVariants} className="card relative overflow-hidden">
                {isSearching && <div className="loading-progress-bar" />}
                <div className="card-header flex justify-between items-center">
                    <h3 className={`card-title ${isSearching ? 'searching-pulse' : ''}`}>
                        <FileSearch size={20} />
                        Matching Rows ({searchResults?.totalFound.toLocaleString() || 0})
                    </h3>
                    <PaginationControls
                        localThreshold={localThreshold}
                        setLocalThreshold={setLocalThreshold}
                        searchState={searchState}
                        setSearchState={setSearchState}
                        onRefresh={onRefresh}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                    />
                </div>

                <div className="card-body" style={{ padding: 0 }}>
                    <ResultsTable
                        results={paginatedResults}
                        headers={fileInfo?.headers || []}
                        criteriaCount={activeCriteriasCount}
                    />
                </div>

                {/* Pagination Footer */}
                <div className="card-footer flex justify-between items-center">
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Showing {searchResults ? Math.min(searchResults.results.length, (currentPage - 1) * pageSize + 1) : 0} to {searchResults ? Math.min(searchResults.results.length, currentPage * pageSize) : 0} of {searchResults?.results.length || 0} matches
                    </div>
                    <PaginationControls
                        showSettings={false}
                        localThreshold={localThreshold}
                        setLocalThreshold={setLocalThreshold}
                        searchState={searchState}
                        setSearchState={setSearchState}
                        onRefresh={onRefresh}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}



