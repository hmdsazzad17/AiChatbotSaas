import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Create({ bot }) {
    const [type, setType] = useState('text');

    const { data, setData, post, processing, errors } = useForm({
        type: 'text',
        content_text: '',
        source_uri: '',
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('knowledge.store', bot.id));
    };

    return (
        <AppLayout
            title="Add Knowledge Source"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Add Knowledge to {bot.name}
                </h2>
            )}
        >
            <Head title="Add Knowledge Source" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="type" value="Source Type" />
                                <select
                                    id="type"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.type}
                                    onChange={(e) => {
                                        setData('type', e.target.value);
                                        setType(e.target.value);
                                    }}
                                >
                                    <option value="text">Raw Text</option>
                                    <option value="url">Website URL</option>
                                    <option value="pdf">PDF Document</option>
                                </select>
                                <InputError message={errors.type} className="mt-2" />
                            </div>

                            {type === 'text' && (
                                <div className="mb-4">
                                    <InputLabel htmlFor="content_text" value="Content" />
                                    <textarea
                                        id="content_text"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows="5"
                                        value={data.content_text}
                                        onChange={(e) => setData('content_text', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.content_text} className="mt-2" />
                                </div>
                            )}

                            {type === 'url' && (
                                <div className="mb-4">
                                    <InputLabel htmlFor="source_uri" value="Website URL" />
                                    <TextInput
                                        id="source_uri"
                                        type="url"
                                        className="mt-1 block w-full"
                                        value={data.source_uri}
                                        onChange={(e) => setData('source_uri', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                    <InputError message={errors.source_uri} className="mt-2" />
                                </div>
                            )}

                            {type === 'pdf' && (
                                <div className="mb-4">
                                    <InputLabel htmlFor="file" value="PDF File" />
                                    <input
                                        id="file"
                                        type="file"
                                        accept=".pdf"
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('file', e.target.files[0])}
                                    />
                                    <InputError message={errors.file} className="mt-2" />
                                </div>
                            )}

                            <div className="flex items-center justify-end mt-4">
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Add Knowledge
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
