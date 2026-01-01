import { motion } from 'framer-motion';
import { MatchResult, FileInfo } from '../types';

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

export default function ResultsTable({ results, headers, criteriaCount }: ResultsTableProps) {
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
        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-surface)' }}>
                            Score
                        </th>
                        {Array.from({ length: criteriaCount }).map((_, i) => (
                            <th key={`criteria-${i}`} colSpan={3}>
                                Criteria {i + 1}
                            </th>
                        ))}
                        {headers.map((header, i) => (
                            <th key={`header-${i}`}>{header}</th>
                        ))}
                    </tr>
                    <tr>
                        <th style={{ position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-surface)' }}></th>
                        {Array.from({ length: criteriaCount }).map((_, i) => (
                            <>
                                <th key={`match-${i}`} style={{ fontSize: '0.7rem' }}>Match</th>
                                <th key={`spell-${i}`} style={{ fontSize: '0.7rem' }}>Spell%</th>
                                <th key={`phon-${i}`} style={{ fontSize: '0.7rem' }}>Phon%</th>
                            </>
                        ))}
                        {headers.map((_, i) => (
                            <th key={`sub-${i}`}></th>
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
                            <td style={{
                                position: 'sticky',
                                left: 0,
                                background: 'var(--bg-elevated)',
                                zIndex: 1
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
                                <>
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
                                </>
                            ))}

                            {result.candidateValues.map((val, vIndex) => (
                                <td key={`val-${vIndex}`}>{val || '-'}</td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
