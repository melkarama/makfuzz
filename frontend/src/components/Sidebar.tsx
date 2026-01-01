import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TableProperties,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const navItems = [
    { path: '/', icon: TableProperties, label: 'Fuzz Explorer', section: 'main' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const location = useLocation();

    const mainItems = navItems.filter(i => i.section === 'main');

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <motion.div
                        className="sidebar-logo-icon"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Sparkles size={24} />
                    </motion.div>
                    <span className="sidebar-logo-text">MakFuzz</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Main Menu</div>
                    {mainItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}
                            >
                                <item.icon className="nav-item-icon" size={20} />
                                <span>{item.label}</span>
                            </motion.div>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <motion.div
                    className="flex items-center gap-sm text-muted"
                    style={{ fontSize: '0.8rem' }}
                >
                    <Sparkles size={14} />
                    <span>v1.0.0 • 2026</span>
                </motion.div>
            </div>
        </aside>
    );
}
