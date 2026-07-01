import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen bg-dark-deep text-white flex flex-col grain-overlay relative overflow-hidden">
            {/* Big background 404 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="font-display text-[40vw] md:text-[35vw] leading-none text-white/[0.04] tracking-tight">404</span>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 relative z-10">
                <div className="max-w-2xl w-full text-center">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="w-8 h-px bg-cyan" />
                        <p className="text-[10px] tracking-[0.4em] uppercase text-cyan">Lost in the void</p>
                        <div className="w-8 h-px bg-cyan" />
                    </div>

                    <h1 className="font-display text-[20vw] md:text-[12rem] leading-[0.85] uppercase mb-6">
                        <span className="text-white">4</span>
                        <span className="text-cyan">0</span>
                        <span className="text-white">4</span>
                    </h1>

                    <h2 className="font-display text-2xl md:text-4xl uppercase leading-tight mb-4">
                        Even We Collapse Sometimes.
                    </h2>

                    <p className="text-sm text-white/60 mb-10 max-w-md mx-auto">
                        The page <span className="text-cyan">"/{pageName}"</span> doesn't exist. But the mission does. Get back up.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-3 bg-cyan text-dark-deep px-10 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors group"
                        >
                            Back Home
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-3 border border-white/30 text-white px-10 py-4 text-[11px] tracking-[0.25em] uppercase hover:border-cyan hover:text-cyan transition-colors"
                        >
                            Shop Collection
                        </Link>
                    </div>

                    {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-12 p-5 border border-cyan/30 bg-cyan/5 text-left max-w-md mx-auto">
                            <p className="text-[10px] tracking-[0.3em] uppercase text-cyan mb-2">Admin Note</p>
                            <p className="text-xs text-white/70 leading-relaxed">
                                This could mean the AI hasn't implemented this page yet. Ask it to implement it in the chat.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-white/10 py-6 text-center relative z-10">
                <p className="font-display text-lg md:text-xl uppercase tracking-widest text-white/40">
                    TILL I COLLAPSE · EST. 2024
                </p>
            </div>
        </div>
    );
}