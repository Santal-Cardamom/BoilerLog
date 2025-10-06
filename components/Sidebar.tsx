import React from 'react';
import { Page } from '../types';
import { ChartIcon } from './icons/ChartIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CogIcon } from './icons/CogIcon';

interface SidebarProps {
    isOpen: boolean;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, setCurrentPage, closeSidebar }) => {
    const mainNavItems = [
        { page: Page.Summary, icon: <ChartIcon /> },
        { page: Page.NewEntry, icon: <PlusIcon /> },
    ];

    const settingsNavItem = { page: Page.Settings, icon: <CogIcon /> };

    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (isOpen) {
            closeSidebar();
        }
    };

    const navLinkClasses = (page: Page) => `flex items-center p-3 rounded-lg transition-colors duration-200 ${
        currentPage === page
            ? 'bg-sky-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

    const navLabelClasses = `ml-4 font-semibold transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`;

    return (
        <aside 
            className={`fixed top-0 left-0 h-full bg-slate-800 text-white flex flex-col transition-all duration-300 z-30 ${isOpen ? 'w-64' : 'w-20'}`}
        >
            <div className="flex items-center justify-center h-16 border-b border-slate-700 px-4">
                <span className={`font-bold text-xl transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Boiler Log</span>
            </div>
            <nav className="flex-1 mt-6 flex flex-col justify-between">
                <ul>
                    {mainNavItems.map(item => (
                        <li key={item.page} className="px-4 mb-2">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleNavigation(item.page); }}
                                className={navLinkClasses(item.page)}
                                aria-current={currentPage === item.page ? 'page' : undefined}
                            >
                                <span className="flex-shrink-0" aria-hidden="true">{item.icon}</span>
                                <span className={navLabelClasses}>
                                    {item.page}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
                <ul>
                     <li className="px-4 mb-4">
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleNavigation(settingsNavItem.page); }}
                            className={navLinkClasses(settingsNavItem.page)}
                            aria-current={currentPage === settingsNavItem.page ? 'page' : undefined}
                        >
                            <span className="flex-shrink-0" aria-hidden="true">{settingsNavItem.icon}</span>
                            <span className={navLabelClasses}>
                                {settingsNavItem.page}
                            </span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;