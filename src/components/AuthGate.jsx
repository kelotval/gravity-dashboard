import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Loader, CheckCircle } from 'lucide-react';

export default function AuthGate({ children, onUserChange }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [sendingLink, setSendingLink] = useState(false);
    const [linkSent, setLinkSent] = useState(false);

    useEffect(() => {
        // If no Supabase client, bypass auth
        if (!supabase) {
            setLoading(false);
            onUserChange?.(null);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
            onUserChange?.(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            onUserChange?.(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [onUserChange]);

    const handleSendMagicLink = async (e) => {
        e.preventDefault();
        if (!email || !supabase) return;

        setSendingLink(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        setSendingLink(false);

        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            setLinkSent(true);
        }
    };

    const handleSignOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    };

    // If no Supabase configured, bypass auth
    if (!supabase) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome to ER Finance
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Sign in with a magic link sent to your email
                        </p>
                    </div>

                    {linkSent ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <p className="text-green-800 dark:text-green-200 font-medium">Check your email!</p>
                            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                                We've sent a magic link to <strong>{email}</strong>
                            </p>
                            <button
                                onClick={() => setLinkSent(false)}
                                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMagicLink} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sendingLink || !email}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                {sendingLink ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        Send Magic Link
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {children}
            {/* Optional: Sign out button in bottom corner */}
            <button
                onClick={handleSignOut}
                className="fixed bottom-4 right-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg shadow-lg transition opacity-50 hover:opacity-100"
                title="Sign Out"
            >
                Sign Out
            </button>
        </div>
    );
}
