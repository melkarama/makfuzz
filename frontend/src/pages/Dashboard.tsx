import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileSearch,
    TrendingUp,
    Clock,
    FileText,
    Users,
    Sparkles,
    ArrowRight,
    Upload
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { FileInfo, SearchResponse } from '../types';

interface DashboardProps {
    fileInfo: FileInfo | null;
    searchResults: SearchResponse | null;
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

export default function Dashboard({ fileInfo, searchResults, onFileUploaded }: DashboardProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="mb-lg">
                <div style={{
                    background: 'var(--gradient-mesh)',
                    borderRadius: 'var(--radius-2xl)',
                    padding: 'var(--space-3xl)',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(138, 100, 255, 0.15) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                        <motion.div
                            className="flex items-center gap-sm mb-md"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Sparkles size={24} style={{ color: 'var(--primary-400)' }} />
                            <span className="badge badge-primary">Fuzzy Matching Engine</span>
                        </motion.div>

                        <h1 style={{
                            fontSize: '2.5rem',
                            marginBottom: 'var(--space-md)',
                            background: 'var(--gradient-primary)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Welcome to MakFuzz
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            marginBottom: 'var(--space-xl)'
                        }}>
                            The ultimate data cleaning & deduplication tool. Find needles in haystacks with our
                            powerful combination of <strong style={{ color: 'var(--primary-300)' }}>Spelling Similarity</strong> and
                            <strong style={{ color: 'var(--accent-400)' }}> Phonetic Matching</strong>.
                        </p>

                        <div className="flex gap-md">
                            <motion.button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate('/search')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FileSearch size={20} />
                                Start Searching
                                <ArrowRight size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            {(fileInfo || searchResults) && (
                <motion.div variants={itemVariants} className="stats-grid">
                    {fileInfo && (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon primary">
                                    <FileText size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{fileInfo.headers.length}</div>
                                    <div className="stat-label">Columns</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon success">
                                    <Users size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{fileInfo.totalRows.toLocaleString()}</div>
                                    <div className="stat-label">Total Rows</div>
                                </div>
                            </div>
                        </>
                    )}

                    {searchResults && (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon warning">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{searchResults.totalFound.toLocaleString()}</div>
                                    <div className="stat-label">Matches Found</div>
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
                        </>
                    )}
                </motion.div>
            )}

            {/* File Upload */}
            <motion.div variants={itemVariants}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Upload size={20} />
                            Data Source
                        </h3>
                    </div>
                    <div className="card-body">
                        <FileUpload onFileUploaded={onFileUploaded} currentFile={fileInfo} />
                    </div>
                </div>
            </motion.div>


        </motion.div>
    );
}
