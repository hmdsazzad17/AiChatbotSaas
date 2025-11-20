import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ conversations, bots }) {
    return (
        <AppLayout
            title="Inbox"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Conversation Inbox
                </h2>
            )}
        >
            <Head title="Inbox" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Conversations</h3>

                        {conversations.data.length > 0 ? (
                            <div className="space-y-4">
                                {conversations.data.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={route('inbox.show', conversation.id)}
                                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {conversation.bot.name}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${conversation.platform === 'web' ? 'bg-blue-100 text-blue-800' :
                                                            conversation.platform === 'fb' ? 'bg-indigo-100 text-indigo-800' :
                                                                'bg-green-100 text-green-800'
                                                        }`}>
                                                        {conversation.platform.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    User ID: {conversation.external_user_id}
                                                </p>
                                                {conversation.messages && conversation.messages.length > 0 && (
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                                        Last: {conversation.messages[0].content}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(conversation.updated_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No conversations yet. Share your widget or set up Meta integration to start receiving messages.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
