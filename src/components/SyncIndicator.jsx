import React from 'react';
import { Loader, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react';

export default function SyncIndicator({ status }) {
    const indicators = {
        loading: {
            icon: Loader,
            text: 'Loading',
            className: 'text-blue-600 dark:text-blue-400',
            bgClassName: 'bg-blue-50 dark:bg-blue-900/20',
            animate: true,
        },
        saving: {
            icon: Cloud,
            text: 'Saving',
            className: 'text-yellow-600 dark:text-yellow-400',
            bgClassName: 'bg-yellow-50 dark:bg-yellow-900/20',
            animate: true,
        },
        synced: {
            icon: Check,
            text: 'Synced',
            className: 'text-green-600 dark:text-green-400',
            bgClassName: 'bg-green-50 dark:bg-green-900/20',
            animate: false,
        },
        offline: {
            icon: CloudOff,
            text: 'Offline',
            className: 'text-gray-600 dark:text-gray-400',
            bgClassName: 'bg-gray-50 dark:bg-gray-900/20',
            animate: false,
        },
        error: {
            icon: AlertCircle,
            text: 'Error',
            className: 'text-red-600 dark:text-red-400',
            bgClassName: 'bg-red-50 dark:bg-red-900/20',
            animate: false,
        },
    };

    const config = indicators[status] || indicators.offline;
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgClassName} transition-all`}>
            <Icon
                className={`w-4 h-4 ${config.className} ${config.animate ? 'animate-spin' : ''}`}
            />
            <span className={`text-xs font-medium ${config.className}`}>
                {config.text}
            </span>
        </div>
    );
}
