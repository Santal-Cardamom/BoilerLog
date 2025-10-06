import * as React from 'react';
import { CommentLog, TestParameters } from '../types';
import { XIcon } from './icons/XIcon';

interface CommentsHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    allComments: CommentLog[];
    settings: TestParameters;
}

const ITEMS_PER_PAGE = 10;

const CommentsHistoryModal: React.FC<CommentsHistoryModalProps> = ({ isOpen, onClose, allComments, settings }) => {
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
        }
    }, [isOpen]);

    const paginatedComments = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return allComments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, allComments]);

    const totalPages = Math.ceil(allComments.length / ITEMS_PER_PAGE);

    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">All Comments</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" aria-label="Close">
                        <XIcon />
                    </button>
                </header>

                <main className="flex-1 overflow-auto p-6 space-y-4">
                     {paginatedComments.length > 0 ? paginatedComments.map((comment) => (
                        <div key={comment.id} className={`p-3 rounded-md border-l-4 ${comment.category === 'Breakdown' ? 'border-red-500 bg-red-50' : 'border-slate-400 bg-white'}`}>
                            <p className={`text-base ${comment.category === 'Breakdown' ? 'text-red-900' : 'text-slate-800'}`}>{comment.text}</p>
                            <div className="flex justify-between items-center mt-2 text-xs">
                                <span className={`font-semibold px-2 py-0.5 rounded-full ${comment.category === 'Breakdown' ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                                    {comment.category || 'General'}
                                </span>
                                <span className="text-slate-500">
                                   - {getUserNameById(comment.userId)} on {new Date(comment.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-500">No comments found.</div>
                    )}
                </main>

                <footer className="flex items-center justify-between p-4 border-t border-slate-200">
                     <span className="text-sm text-slate-600">
                        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                     </span>
                     <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                     </div>
                </footer>
            </div>
        </div>
    );
};

export default CommentsHistoryModal;
