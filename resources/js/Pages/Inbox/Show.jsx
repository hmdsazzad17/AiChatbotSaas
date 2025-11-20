import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Show({ conversation }) {
    return (
        <AppLayout
            title="Conversation Details"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Conversation with {conversation.external_user_id}
                </h2>
            )}
        >
            <Head title="Conversation Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">{conversation.bot.name}</h3>
                            <p className="text-sm text-gray-600">
                                Platform: <span className="font-medium">{conversation.platform.toUpperCase()}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Started: {new Date(conversation.created_at).toLocaleString()}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {conversation.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-2xl px-4 py-3 rounded-lg ${message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="text-xs font-semibold mb-1">
                                            {message.sender === 'user' ? 'User' : 'Bot'}
                                        </div>
                                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                        <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {new Date(message.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
