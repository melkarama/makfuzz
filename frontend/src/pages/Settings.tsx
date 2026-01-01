import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Palette,
    Globe,
    Info,
    ExternalLink,
    Heart,
    Github
} from 'lucide-react';

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

export default function Settings() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-lg">
                <h1>Settings</h1>
                <p className="text-muted">Configure your MakFuzz experience</p>
            </motion.div>

            {/* Appearance */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Palette size={20} />
                        Appearance
                    </h3>
                </div>
                <div className="card-body">
                    <div className="input-group">
                        <label className="input-label">Theme</label>
                        <select className="input select" defaultValue="dark">
                            <option value="dark">Dark Mode (Default)</option>
                            <option value="light" disabled>Light Mode (Coming Soon)</option>
                            <option value="system" disabled>System Preference (Coming Soon)</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Language */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Globe size={20} />
                        Language & Region
                    </h3>
                </div>
                <div className="card-body">
                    <div className="input-group">
                        <label className="input-label">Interface Language</label>
                        <select className="input select" defaultValue="en">
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Default Phonetic Engine</label>
                        <select className="input select" defaultValue="en">
                            <option value="en">Generic (Beider-Morse)</option>
                            <option value="fr">French (French Soundex)</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* About */}
            <motion.div variants={itemVariants} className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">
                        <Info size={20} />
                        About MakFuzz
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid-2">
                        <div>
                            <div className="text-muted mb-sm" style={{ fontSize: '0.85rem' }}>Version</div>
                            <div className="font-bold">1.0.0</div>
                        </div>
                        <div>
                            <div className="text-muted mb-sm" style={{ fontSize: '0.85rem' }}>Build Date</div>
                            <div className="font-bold">January 2026</div>
                        </div>
                    </div>

                    <div className="mt-lg" style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <p style={{ lineHeight: 1.7 }}>
                            <strong>MakFuzz</strong> is the ultimate fuzzy matching engine for data cleaning and
                            deduplication. It combines advanced <strong style={{ color: 'var(--primary-300)' }}>Jaro-Winkler</strong> spelling
                            similarity with <strong style={{ color: 'var(--accent-400)' }}>Beider-Morse</strong> and <strong style={{ color: 'var(--success-500)' }}>French Soundex</strong> phonetic
                            matching to find the most accurate matches in your data.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Support */}
            <motion.div variants={itemVariants} className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Heart size={20} />
                        Support
                    </h3>
                </div>
                <div className="card-body">
                    <p className="text-muted mb-lg">
                        Love MakFuzz? Help keep the algorithms fuzzy and the UI crisp!
                    </p>
                    <div className="flex gap-md">
                        <motion.a
                            href="https://www.paypal.com/ncp/payment/45JPEGLFJQQSJ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Heart size={18} />
                            Donate with PayPal
                            <ExternalLink size={16} />
                        </motion.a>

                        <motion.a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Github size={18} />
                            View on GitHub
                            <ExternalLink size={16} />
                        </motion.a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
