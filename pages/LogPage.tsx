import React from 'react';
import { SessionLog } from '../shared/types';
import { useLanguage } from '../contexts/LanguageContext';
import { LogEntryForm } from '../components/LogEntryForm';

interface LogPageProps {
    onSave: (log: SessionLog) => void;
    onCancel: () => void;
    initialData?: SessionLog;
}

export const LogPage: React.FC<LogPageProps> = ({ onSave, onCancel, initialData }) => {
    const { t, language } = useLanguage();
    const isEditMode = !!initialData;

    return (
        <div className="pb-32 animate-slide-up px-1">
            <div className="py-4 px-1 mb-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    {isEditMode ? (language === 'zh' ? '编辑记录' : 'Edit Entry') : t.newEntryTitle}
                </h1>
            </div>
            <LogEntryForm onSave={onSave} onCancel={onCancel} initialData={initialData} />
        </div>
    );
};

