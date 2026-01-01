import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { CriteriaInput } from '../types';

interface CriteriaRowProps {
    criteria: CriteriaInput;
    index: number;
    onChange: (index: number, criteria: CriteriaInput) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

export default function CriteriaRow({ criteria, index, onChange, onRemove, canRemove }: CriteriaRowProps) {
    const handleChange = (field: keyof CriteriaInput, value: any) => {
        onChange(index, { ...criteria, [field]: value });
    };

    return (
        <motion.div
            className="criteria-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
        >
            {/* Search Value */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Search Term #{index + 1}</label>
                <input
                    type="text"
                    className="input"
                    placeholder="Enter search value..."
                    value={criteria.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                />
            </div>

            {/* Spelling Weight */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Spell W.</label>
                <input
                    type="number"
                    className="input"
                    min="0"
                    max="10"
                    step="0.1"
                    value={criteria.spellingWeight}
                    onChange={(e) => handleChange('spellingWeight', parseFloat(e.target.value) || 0)}
                />
            </div>

            {/* Phonetic Weight */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Phon. W.</label>
                <input
                    type="number"
                    className="input"
                    min="0"
                    max="10"
                    step="0.1"
                    value={criteria.phoneticWeight}
                    onChange={(e) => handleChange('phoneticWeight', parseFloat(e.target.value) || 0)}
                />
            </div>

            {/* Min Spelling */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Min Spell %</label>
                <input
                    type="number"
                    className="input"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(criteria.minSpellingScore * 100)}
                    onChange={(e) => handleChange('minSpellingScore', (parseFloat(e.target.value) || 0) / 100)}
                />
            </div>

            {/* Min Phonetic */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Min Phon %</label>
                <input
                    type="number"
                    className="input"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(criteria.minPhoneticScore * 100)}
                    onChange={(e) => handleChange('minPhoneticScore', (parseFloat(e.target.value) || 0) / 100)}
                />
            </div>

            {/* Matching Type */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Match Type</label>
                <select
                    className="input select"
                    value={criteria.matchingType}
                    onChange={(e) => handleChange('matchingType', e.target.value as CriteriaInput['matchingType'])}
                >
                    <option value="SIMILARITY">Similarity</option>
                    <option value="EXACT">Exact</option>
                    <option value="REGEX">Regex</option>
                </select>
            </div>

            {/* Remove Button */}
            <div className="input-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <label className="input-label" style={{ opacity: 0 }}>&nbsp;</label>
                <div className="flex items-center justify-center" style={{ flex: 1 }}>
                    <motion.button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => onRemove(index)}
                        whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        style={{ color: 'var(--danger-500)' }}
                        title="Remove Criteria"
                    >
                        <X size={18} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
