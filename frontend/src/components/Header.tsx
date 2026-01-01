import { motion } from 'framer-motion';
import { Menu, Bell, User, FileText, HardDrive } from 'lucide-react';
import { FileInfo } from '../types';

interface HeaderProps {
    onMenuToggle: () => void;
    fileInfo: FileInfo | null;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function Header({ onMenuToggle, fileInfo }: HeaderProps) {
    return (
        <header className="header">
            <div className="flex items-center gap-md">
                <motion.button
                    className="btn btn-ghost btn-icon"
                    onClick={onMenuToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'none' }} // Hidden on desktop
                >
                    <Menu size={20} />
                </motion.button>

                {fileInfo && (
                    <motion.div
                        className="flex items-center gap-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="badge badge-primary flex items-center gap-sm">
                            <FileText size={14} />
                            <span>{fileInfo.fileName}</span>
                        </div>
                        <div className="badge flex items-center gap-sm">
                            <HardDrive size={14} />
                            <span>{formatBytes(fileInfo.fileSizeBytes)}</span>
                        </div>
                        <div className="badge flex items-center gap-sm">
                            <span>{fileInfo.totalRows.toLocaleString()} rows</span>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="header-actions">
                <motion.button
                    className="btn btn-ghost btn-icon"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Bell size={20} />
                </motion.button>

                <motion.div
                    className="flex items-center gap-sm"
                    style={{
                        padding: '6px 12px',
                        background: 'var(--bg-glass-strong)',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={16} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Guest</span>
                </motion.div>
            </div>
        </header>
    );
}
