import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Download,
    FileSearch,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    BarChart3,
    ArrowLeft
} from 'lucide-react';
import ResultsTable from '../components/ResultsTable';
import { api } from '../api';
import { FileInfo, SearchResponse, SearchState } from '../types';

interface ResultsProps {
    fileInfo: FileInfo | null;
    searchResults: SearchResponse | null;
    searchState: SearchState;
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

function formatPercent(value: number): string {
    return (value * 100).toFixed(2) + '%';
}

export default function Results({ fileInfo, searchResults, searchState }: ResultsProps) {
    const navigate = useNavigate();

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
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [fileInfo, searchState]);

    if (!searchResults) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="empty-state">
                    <div className="empty-state-icon">
                        <FileSearch size={80} />
                    </div>
                    <h2 className="empty-state-title">No Search Results</h2>
                    <p className="empty-state-text mb-lg">
                        Run a fuzzy search first to see matching results here.
                    </p>
                    <motion.button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate('/search')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FileSearch size={20} />
                        Go to Search
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    const activeCriteriasCount = searchState.criterias.filter(c => c.value.trim() !== '').length;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Actions */}
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-lg">
                <div className="flex items-center gap-md">
                    <motion.button
                        className="btn btn-ghost"
                        onClick={() => navigate('/search')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowLeft size={18} />
                        Back to Search
                    </motion.button>
                    <h2>Search Results</h2>
                </div>

                <motion.button
                    className="btn btn-primary"
                    onClick={handleExport}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Download size={18} />
                    Export CSV
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Target size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{searchResults.totalFound.toLocaleString()}</div>
                        <div className="stat-label">Matches Found</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{searchResults.totalResults.toLocaleString()}</div>
                        <div className="stat-label">Total Records</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formatPercent(searchResults.maxAboveThreshold)}</div>
                        <div className="stat-label">Best Match</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-500)' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formatPercent(searchResults.minAboveThreshold)}</div>
                        <div className="stat-label">Lowest Match</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{searchResults.searchTimeMs}ms</div>
                        <div className="stat-label">Search Time</div>
                    </div>
                </div>
            </motion.div>

            {/* Metrics Card */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <BarChart3 size={20} />
                        Search Metrics
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid-3">
                        <div>
                            <div className="text-muted mb-sm" style={{ fontSize: '0.85rem' }}>Max Under Threshold</div>
                            <div className="font-bold" style={{ fontSize: '1.25rem', color: 'var(--warning-500)' }}>
                                {formatPercent(searchResults.maxUnderThreshold)}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Best "near miss"</div>
                        </div>
                        <div>
                            <div className="text-muted mb-sm" style={{ fontSize: '0.85rem' }}>Min Above Threshold</div>
                            <div className="font-bold" style={{ fontSize: '1.25rem', color: 'var(--success-500)' }}>
                                {formatPercent(searchResults.minAboveThreshold)}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Lowest qualifying match</div>
                        </div>
                        <div>
                            <div className="text-muted mb-sm" style={{ fontSize: '0.85rem' }}>Match Rate</div>
                            <div className="font-bold" style={{ fontSize: '1.25rem', color: 'var(--primary-400)' }}>
                                {searchResults.totalResults > 0
                                    ? ((searchResults.totalFound / searchResults.totalResults) * 100).toFixed(2)
                                    : 0}%
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Records matched</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Results Table */}
            <motion.div variants={itemVariants} className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <FileSearch size={20} />
                        Match Results ({searchResults.results.length} shown)
                    </h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <ResultsTable
                        results={searchResults.results}
                        headers={fileInfo?.headers || []}
                        criteriaCount={activeCriteriasCount}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
