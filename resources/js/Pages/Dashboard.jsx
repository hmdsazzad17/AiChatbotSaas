import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AppLayout
            title="Dashboard"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            )}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Welcome to your AI Assistant Dashboard!
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Manage your AI bots, train them with custom knowledge, and deploy across multiple channels.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Link
                                href={route('bots.index')}
                                className="block p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transition text-white"
                            >
                                <h3 className="text-xl font-semibold mb-2">🤖 My Bots</h3>
                                <p className="text-blue-100">Create and manage your AI assistants</p>
                            </Link>

                            <Link
                                href={route('inbox.index')}
                                className="block p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transition text-white"
                            >
                                <h3 className="text-xl font-semibold mb-2">💬 Inbox</h3>
                                <p className="text-purple-100">View all conversations</p>
                            </Link>

                            <Link
                                href={route('integrations.index')}
                                className="block p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg hover:shadow-xl transition text-white"
                            >
                                <h3 className="text-xl font-semibold mb-2">🔌 Integrations</h3>
                                <p className="text-green-100">Get widget code & setup channels</p>
                            </Link>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg text-gray-900 mb-4">Quick Start Guide</h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                <li>Create your first bot</li>
                                <li>Upload knowledge sources (PDF, URL, or text)</li>
                                <li>Get the widget code from Integrations</li>
                                <li>Embed on your website</li>
                                <li>Monitor conversations in the Inbox</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
