import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MatchResult } from '../types';

interface ResultsTableProps {
    results: MatchResult[];
    headers: string[];
    criteriaCount: number;
}

function getScoreColor(score: number): string {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
}

function formatPercent(value: number): string {
    return (value * 100).toFixed(1) + '%';
}

const ResultsTable = React.memo(({ results, headers, criteriaCount }: ResultsTableProps) => {
    if (!results || results.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-title">No Results</div>
                <div className="empty-state-text">
                    Adjust your search criteria or threshold to find more matches.
                </div>
            </div>
        );
    }

    return (
        <div className="table-container" style={{ maxHeight: '600px' }}>
            <table className="table" style={{ tableLayout: 'auto' }}>
                <thead>
                    <tr>
                        <th style={{
                            position: 'sticky',
                            left: 0,
                            top: 0,
                            zIndex: 22,
                            background: 'var(--bg-surface)',
                            width: '80px',
                            minWidth: '80px',
                            borderRight: '1px solid var(--border-subtle)'
                        }}>
                            Row #
                        </th>
                        <th style={{
                            position: 'sticky',
                            left: '80px',
                            top: 0,
                            zIndex: 21,
                            background: 'var(--bg-surface)',
                            width: '140px',
                            minWidth: '140px'
                        }}>
                            Score
                        </th>
                        {Array.from({ length: criteriaCount }).map((_, i) => (
                            <React.Fragment key={i}>
                                <th key={`match-h-${i}`}>Criteria {i + 1}</th>
                                <th key={`spell-h-${i}`}>Spell%</th>
                                <th key={`phon-h-${i}`}>Phon%</th>
                            </React.Fragment>
                        ))}
                        {headers.map((header, i) => (
                            <th key={`header-${i}`}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, rowIndex) => (
                        <motion.tr
                            key={rowIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rowIndex * 0.02 }}
                        >
                            <td
                                onClick={() => {
                                    if (result.rawLine) {
                                        toast(result.rawLine, {
                                            duration: 6000,
                                            icon: '📄',
                                            style: {
                                                maxWidth: '800px',
                                                background: 'var(--bg-surface)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid var(--border-glow)',
                                                backdropFilter: 'blur(10px)',
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem',
                                                wordBreak: 'break-all'
                                            }
                                        });
                                    }
                                }}
                                style={{
                                    position: 'sticky',
                                    left: 0,
                                    background: 'var(--bg-elevated)',
                                    zIndex: 6,
                                    width: '80px',
                                    minWidth: '80px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: result.rawLine ? 'var(--primary-300)' : 'var(--text-secondary)',
                                    borderRight: '1px solid var(--border-subtle)',
                                    cursor: result.rawLine ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease'
                                }}
                                className={result.rawLine ? 'hover-primary' : ''}
                                title={result.rawLine ? "Click to view original CSV line" : ""}
                            >
                                {result.lineIndex}
                                {result.rawLine && (
                                    <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>View</div>
                                )}
                            </td>
                            <td style={{
                                position: 'sticky',
                                left: '80px',
                                background: 'var(--bg-elevated)',
                                zIndex: 5,
                                width: '140px',
                                minWidth: '140px'
                            }}>
                                <div className="score-cell">
                                    <div className="score-bar">
                                        <div
                                            className={`score-bar-fill ${getScoreColor(result.totalScore)}`}
                                            style={{ width: `${result.totalScore * 100}%` }}
                                        />
                                    </div>
                                    <span className="score-value">{formatPercent(result.totalScore)}</span>
                                </div>
                            </td>

                            {result.criteriaMatches.map((match, mIndex) => (
                                <React.Fragment key={mIndex}>
                                    <td key={`match-val-${mIndex}`}>
                                        <span className="badge badge-primary">
                                            {match.matchedValue || '-'}
                                        </span>
                                    </td>
                                    <td key={`spell-val-${mIndex}`}>
                                        <span className={`text-${getScoreColor(match.spellingScore) === 'high' ? 'success' : getScoreColor(match.spellingScore) === 'medium' ? 'warning' : 'danger'}`}>
                                            {formatPercent(match.spellingScore)}
                                        </span>
                                    </td>
                                    <td key={`phon-val-${mIndex}`}>
                                        <span className={`text-${getScoreColor(match.phoneticScore) === 'high' ? 'success' : getScoreColor(match.phoneticScore) === 'medium' ? 'warning' : 'danger'}`}>
                                            {formatPercent(match.phoneticScore)}
                                        </span>
                                    </td>
                                </React.Fragment>
                            ))}

                            {result.candidateValues.map((val, vIndex) => {
                                const isMatched = result.criteriaMatches.some(m => m.columnIndex === vIndex);
                                return (
                                    <td key={`val-${vIndex}`} className={isMatched ? 'match-highlight' : ''}>
                                        {val || '-'}
                                    </td>
                                );
                            })}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default ResultsTable;
