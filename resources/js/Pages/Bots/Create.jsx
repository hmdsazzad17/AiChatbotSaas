import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        role_instruction: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('bots.store'));
    };

    return (
        <AppLayout
            title="Create Bot"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Create New Bot
                </h2>
            )}
        >
            <Head title="Create Bot" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Bot Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g., Customer Support Bot"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="role_instruction" value="System Prompt / Role Instruction" />
                                <textarea
                                    id="role_instruction"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="6"
                                    value={data.role_instruction}
                                    onChange={(e) => setData('role_instruction', e.target.value)}
                                    placeholder="e.g., You are a helpful customer service assistant for an e-commerce company. Answer questions politely and professionally."
                                ></textarea>
                                <InputError message={errors.role_instruction} className="mt-2" />
                                <p className="text-sm text-gray-500 mt-1">
                                    This defines the bot's personality and behavior. Leave blank for default.
                                </p>
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Create Bot
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
