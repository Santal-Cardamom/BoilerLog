
import * as React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen, title }) => {
    return (
        <header className="flex-shrink-0 bg-white h-16 flex items-center px-6 border-b border-slate-200 shadow-sm">
            <button 
                onClick={toggleSidebar} 
                className="mr-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </button>
            <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        </header>
    );
};

export default Header;