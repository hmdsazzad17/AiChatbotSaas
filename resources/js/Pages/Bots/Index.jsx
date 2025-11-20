import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ bots }) {
    return (
        <AppLayout
            title="My Bots"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    My Bots
                </h2>
            )}
        >
            <Head title="My Bots" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Your AI Bots</h3>
                            <Link
                                href={route('bots.create')}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Create New Bot
                            </Link>
                        </div>

                        {bots.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bots.map((bot) => (
                                    <div key={bot.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{bot.name}</h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {bot.role_instruction || 'No instruction set'}
                                        </p>
                                        <div className="text-xs text-gray-500 mb-4">
                                            Created: {new Date(bot.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('bots.edit', bot.id)}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={route('knowledge.index', bot.id)}
                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                Knowledge
                                            </Link>
                                            <Link
                                                href={route('bots.destroy', bot.id)}
                                                method="delete"
                                                as="button"
                                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">You haven't created any bots yet.</p>
                                <Link
                                    href={route('bots.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                >
                                    Create Your First Bot
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
