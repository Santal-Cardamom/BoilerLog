import * as React from 'react';
import { CommentLog, TestParameters, EntryView } from '../types';
import CommentsHistoryModal from './CommentsHistoryModal';

interface RecentCommentsProps {
    commentLogs: CommentLog[];
    settings: TestParameters;
    setNewEntryTarget: (target: EntryView) => void;
}

const RecentComments: React.FC<RecentCommentsProps> = ({ commentLogs, settings, setNewEntryTarget }) => {
    const [isHistoryModalOpen, setHistoryModalOpen] = React.useState(false);

    const sortedComments = React.useMemo(() => {
        return [...commentLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [commentLogs]);

    const recentComments = sortedComments.slice(0, 3);
    
    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 h-full flex flex-col">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Recent Comments</h3>
            <div className="flex-grow space-y-2 overflow-y-auto pr-2 min-h-[100px]">
                {recentComments.length > 0 ? (
                    recentComments.map(comment => (
                        <div key={comment.id} className={`p-2 rounded-md border-l-4 text-sm ${comment.category === 'Breakdown' ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'}`}>
                            <p className={`truncate ${comment.category === 'Breakdown' ? 'text-red-800' : 'text-slate-700'}`}>
                                {comment.text}
                            </p>
                            <p className="text-xs text-slate-500 text-right mt-1">
                                - {getUserNameById(comment.userId)}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-slate-500 py-4 flex items-center justify-center h-full">No comments yet.</div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button 
                    onClick={() => setNewEntryTarget('addComment')}
                    className="px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    Add Comment
                </button>
                <button 
                    onClick={() => setHistoryModalOpen(true)} 
                    disabled={commentLogs.length === 0}
                    className="px-3 py-1.5 bg-white text-sky-600 text-xs font-semibold rounded-md border border-sky-600 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    View All
                </button>
            </div>
            <CommentsHistoryModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                allComments={sortedComments}
                settings={settings}
            />
        </div>
    );
};

export default RecentComments;
