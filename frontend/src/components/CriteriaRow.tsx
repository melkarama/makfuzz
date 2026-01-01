import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { CriteriaInput } from '../types';

interface CriteriaRowProps {
    criteria: CriteriaInput;
    index: number;
    onChange: (index: number, criteria: CriteriaInput) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
    onSearch?: () => void;
}

export default function CriteriaRow({ criteria, index, onChange, onRemove, canRemove, onSearch }: CriteriaRowProps) {
    const debounceTimer = useRef<any>();

    // Local state for smooth typing - decoupled from expensive parent re-renders
    const [localSpellWeight, setLocalSpellWeight] = useState(criteria.spellingWeight.toString());
    const [localPhonWeight, setLocalPhonWeight] = useState(criteria.phoneticWeight.toString());
    const [localMinSpell, setLocalMinSpell] = useState(Math.round(criteria.minSpellingScore * 100).toString());
    const [localMinPhon, setLocalMinPhon] = useState(Math.round(criteria.minPhoneticScore * 100).toString());

    // Sync local state ONLY when parent criteria changes fundamentally (e.g. initial load or add/remove)
    // We don't sync on every minor change to avoid fighting the user's typing
    useEffect(() => {
        setLocalSpellWeight(prev => {
            const currentProp = criteria.spellingWeight.toString();
            return (parseFloat(prev) === criteria.spellingWeight) ? prev : currentProp;
        });
        setLocalPhonWeight(prev => {
            const currentProp = criteria.phoneticWeight.toString();
            return (parseFloat(prev) === criteria.phoneticWeight) ? prev : currentProp;
        });
        setLocalMinSpell(prev => {
            const currentProp = Math.round(criteria.minSpellingScore * 100).toString();
            return (parseInt(prev) === Math.round(criteria.minSpellingScore * 100)) ? prev : currentProp;
        });
        setLocalMinPhon(prev => {
            const currentProp = Math.round(criteria.minPhoneticScore * 100).toString();
            return (parseInt(prev) === Math.round(criteria.minPhoneticScore * 100)) ? prev : currentProp;
        });
    }, [criteria.spellingWeight, criteria.phoneticWeight, criteria.minSpellingScore, criteria.minPhoneticScore]);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const triggerUpdate = (field: keyof CriteriaInput, rawValue: string) => {
        let finalValue: any = rawValue;
        if (field === 'spellingWeight' || field === 'phoneticWeight') {
            finalValue = parseFloat(rawValue) || 0;
        } else if (field === 'minSpellingScore' || field === 'minPhoneticScore') {
            finalValue = (parseFloat(rawValue) || 0) / 100;
        }

        // Update parent state
        onChange(index, { ...criteria, [field]: finalValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onSearch) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            onSearch();
        }
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
                    onChange={(e) => {
                        onChange(index, { ...criteria, value: e.target.value });
                    }}
                    onKeyDown={handleKeyDown}
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
                    value={localSpellWeight}
                    onChange={(e) => {
                        setLocalSpellWeight(e.target.value);
                        triggerUpdate('spellingWeight', e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
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
                    value={localPhonWeight}
                    onChange={(e) => {
                        setLocalPhonWeight(e.target.value);
                        triggerUpdate('phoneticWeight', e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
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
                    value={localMinSpell}
                    onChange={(e) => {
                        setLocalMinSpell(e.target.value);
                        triggerUpdate('minSpellingScore', e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
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
                    value={localMinPhon}
                    onChange={(e) => {
                        setLocalMinPhon(e.target.value);
                        triggerUpdate('minPhoneticScore', e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Matching Type */}
            <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Match Type</label>
                <select
                    className="input select"
                    value={criteria.matchingType}
                    onChange={(e) => {
                        onChange(index, { ...criteria, matchingType: e.target.value as CriteriaInput['matchingType'] });
                    }}
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
