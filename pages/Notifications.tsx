import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

interface NotificationsProps {
    notifications: { id: number, title: string, message: string, read: boolean, time: string }[];
    setNotifications: React.Dispatch<React.SetStateAction<{ id: number, title: string, message: string, read: boolean, time: string }[]>>;
}

export const NotificationsView: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4 sm:px-6">
            <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Notifications Center</h2>
                    <p className="text-gray-500 text-sm sm:text-base">All of your channel alerts, updates, and AI signals.</p>
                </div>
                <button 
                  onClick={markAllRead} 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                    <CheckCircle2 size={16} /> Mark All as Read
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                           <Bell size={32} />
                        </div>
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`p-6 transition-colors hover:bg-gray-50 cursor-pointer ${notif.read ? 'opacity-70 bg-white' : 'bg-emerald-50/20'}`}
                                onClick={() => {
                                    setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                      {!notif.read && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
                                      {notif.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">{notif.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{notif.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
