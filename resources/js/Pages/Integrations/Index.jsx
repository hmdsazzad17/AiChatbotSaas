import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Index({ bots }) {
    const [selectedBot, setSelectedBot] = useState(bots[0] || null);
    const [copied, setCopied] = useState(false);

    const widgetCode = selectedBot ? `<script src="${window.location.origin}/js/widget.js" 
        data-bot-token="${selectedBot.access_token}"
        data-api-url="${window.location.origin}/api/chat/incoming"></script>` : '';

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout
            title="Integrations"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Integration & Setup
                </h2>
            )}
        >
            <Head title="Integrations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {bots.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6 text-center">
                            <p className="text-gray-500">Please create a bot first before setting up integrations.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Bot Selector */}
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Bot</h3>
                                <select
                                    className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={selectedBot?.id || ''}
                                    onChange={(e) => setSelectedBot(bots.find(b => b.id === parseInt(e.target.value)))}
                                >
                                    {bots.map(bot => (
                                        <option key={bot.id} value={bot.id}>{bot.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Website Widget */}
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Website Widget</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Copy and paste this code snippet into your website's HTML, just before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag.
                                </p>

                                <div className="relative">
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                        <code>{widgetCode}</code>
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(widgetCode)}
                                        className="absolute top-2 right-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {/* Bot Access Token */}
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Access Token</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Use this token when making API calls to the chat endpoint.
                                </p>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedBot?.access_token || ''}
                                        className="flex-1 border-gray-300 rounded-md shadow-sm bg-gray-50"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(selectedBot?.access_token)}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Meta Integration */}
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Facebook Messenger & WhatsApp</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    To integrate with Facebook Messenger or WhatsApp, you'll need to:
                                </p>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                    <li>Set up a Facebook App and Business Account</li>
                                    <li>Add Messenger or WhatsApp product to your app</li>
                                    <li>Configure webhook URL: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}/api/webhooks/meta</code></li>
                                    <li>Set verify token in your .env: <code className="bg-gray-100 px-2 py-1 rounded">META_VERIFY_TOKEN</code></li>
                                    <li>Add page access tokens to .env</li>
                                </ol>
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-sm text-blue-800">
                                        📘 For detailed setup instructions, refer to the <a href="https://developers.facebook.com/docs/messenger-platform" className="underline" target="_blank" rel="noopener noreferrer">Facebook Developer Documentation</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
