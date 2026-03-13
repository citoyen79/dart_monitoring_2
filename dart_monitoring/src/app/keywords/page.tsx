"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldBan, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Keyword = {
    id: string;
    keyword: string;
    created_at: string;
};

export default function KeywordsPage() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [newKeyword, setNewKeyword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchKeywords();
    }, []);

    async function fetchKeywords() {
        const { data } = await supabase.from("keywords").select("*").order("created_at", { ascending: false });
        if (data) setKeywords(data);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!newKeyword) return;
        setLoading(true);

        const { error } = await supabase.from("keywords").insert([{ keyword: newKeyword.trim() }]);

        if (!error) {
            setNewKeyword("");
            fetchKeywords();
        } else {
            alert("추가 중 오류가 발생했습니다. (이미 등록된 키워드일 수 있습니다)");
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("정말 이 키워드를 제외 목록에서 삭제할까요?")) return;
        await supabase.from("keywords").delete().eq("id", id);
        fetchKeywords();
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-12">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                대시보드로 돌아가기
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <ShieldBan className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">제외 키워드 관리</h1>
                    <p className="text-slate-400 mt-1">해당 키워드가 공시 제목에 포함되면 알림을 보내지 않습니다.</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl mb-12">
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-400 leading-6">제외할 단어 입력</label>
                        <input
                            type="text"
                            placeholder="예: 임원ㆍ주요주주특정증권등소유상황보고서"
                            value={newKeyword}
                            onChange={e => setNewKeyword(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto mt-4 md:mt-0 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        {loading ? "등록 중..." : "등록하기"}
                    </button>
                </form>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
                <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between text-slate-400 text-sm font-medium px-6">
                    <span>등록된 제외 키워드 목록</span>
                </div>
                <ul className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                        {keywords.length === 0 ? (
                            <li className="p-8 text-center text-slate-500">등록된 키워드가 없습니다.</li>
                        ) : (
                            keywords.map(kw => (
                                <motion.li
                                    key={kw.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 px-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors group"
                                >
                                    <span className="font-medium text-lg text-slate-200">
                                        <span className="text-purple-400 mr-2">"</span>
                                        {kw.keyword}
                                        <span className="text-purple-400 ml-2">"</span>
                                    </span>
                                    <button
                                        onClick={() => handleDelete(kw.id)}
                                        className="p-2 text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="삭제"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.li>
                            ))
                        )}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
}
