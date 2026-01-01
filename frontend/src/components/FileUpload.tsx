import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { FileInfo } from '../types';

interface FileUploadProps {
    onFileUploaded: (info: FileInfo) => void;
    currentFile?: FileInfo | null;
}

export default function FileUpload({ onFileUploaded, currentFile }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(async (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const info = await api.uploadFile(file);
            onFileUploaded(info);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    }, [onFileUploaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    if (currentFile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card card-glow"
                style={{ padding: 'var(--space-lg)' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(52, 211, 153, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--success-500)'
                        }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div className="font-bold">{currentFile.fileName}</div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                {currentFile.headers.length} columns • {currentFile.totalRows.toLocaleString()} rows
                            </div>
                        </div>
                    </div>

                    <motion.button
                        className="btn btn-ghost btn-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById('file-input-replace')?.click()}
                    >
                        Replace File
                    </motion.button>
                    <input
                        id="file-input-replace"
                        type="file"
                        accept=".csv"
                        onChange={handleChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`file-upload ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept=".csv"
                onChange={handleChange}
                disabled={isUploading}
            />

            <AnimatePresence mode="wait">
                {isUploading ? (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="loading-spinner mb-md"></div>
                        <div className="text-muted">Uploading file...</div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            animate={{ y: isDragging ? -5 : 0 }}
                            className="file-upload-icon"
                        >
                            <Upload size={64} />
                        </motion.div>
                        <div className="file-upload-text">
                            {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file here'}
                        </div>
                        <div className="file-upload-hint">
                            or click to browse • CSV files only
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-sm mt-lg text-danger"
                        style={{ fontSize: '0.9rem' }}
                    >
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
