"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Company = {
    id: string;
    corp_code: string;
    corp_name: string;
    created_at: string;
};

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [newCode, setNewCode] = useState("");
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    async function fetchCompanies() {
        const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
        if (data) setCompanies(data);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!newCode || !newName) return;
        setLoading(true);

        // Ensure corp_code is padded to 8 digits if they enter less, but user should know.
        let code = newCode.trim();
        if (code.length < 8) code = code.padStart(8, '0');

        const { error } = await supabase.from("companies").insert([{ corp_code: code, corp_name: newName.trim() }]);

        if (!error) {
            setNewCode("");
            setNewName("");
            fetchCompanies();
        } else {
            alert("추가 중 오류가 발생했습니다. (이미 등록된 고유번호일 수 있습니다)");
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("정말 이 기업을 모니터링에서 제외할까요?")) return;
        await supabase.from("companies").delete().eq("id", id);
        fetchCompanies();
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-12">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                대시보드로 돌아가기
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">기업 관리</h1>
                    <p className="text-slate-400 mt-1">모니터링할 기업의 DART 고유번호와 이름을 등록하세요.</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl mb-12">
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative group">
                        <label className="block text-sm font-medium text-slate-400 leading-6">DART 고유번호 (8자리 숫자로 이루어짐)</label>
                        <input
                            type="text"
                            placeholder="00126380 (삼성전자 예시)"
                            value={newCode}
                            onChange={e => setNewCode(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-400 leading-6">기업 이름</label>
                        <input
                            type="text"
                            placeholder="회사명 입력"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto mt-4 md:mt-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        {loading ? "등록 중..." : "등록하기"}
                    </button>
                </form>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
                <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between text-slate-400 text-sm font-medium px-6">
                    <span>기업 이름 (고유번호)</span>
                    <span>관리</span>
                </div>
                <ul className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                        {companies.length === 0 ? (
                            <li className="p-8 text-center text-slate-500">등록된 기업이 없습니다.</li>
                        ) : (
                            companies.map(company => (
                                <motion.li
                                    key={company.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 px-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors group"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-lg text-slate-200">{company.corp_name}</span>
                                        <span className="text-slate-500 text-sm font-mono">{company.corp_code}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(company.id)}
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
