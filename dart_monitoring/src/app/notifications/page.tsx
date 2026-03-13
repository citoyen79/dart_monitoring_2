"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Announcement = {
    id: string;
    rcept_no: string;
    corp_code: string;
    corp_name: string;
    report_nm: string;
    sent_at: string;
};

export default function NotificationsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    async function fetchAnnouncements() {
        const { data } = await supabase.from("announcements").select("*").order("sent_at", { ascending: false }).limit(100);
        if (data) setAnnouncements(data);
    }

    function formatTime(isoStr: string) {
        const d = new Date(isoStr);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-12">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                대시보드로 돌아가기
            </Link>

            <div className="flex items-center gap-3 mb-12">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Bell className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">최근 알림 내역</h1>
                    <p className="text-slate-400 mt-1">텔레그램으로 발송된 최근 100건의 필터링된 자동 공시 알림입니다.</p>
                </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
                <ul className="divide-y divide-slate-800/60 max-h-[700px] overflow-y-auto">
                    <AnimatePresence>
                        {announcements.length === 0 ? (
                            <li className="p-12 text-center text-slate-500">아직 발송된 자동 알림이 없습니다.</li>
                        ) : (
                            announcements.map(ann => (
                                <motion.li
                                    key={ann.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 hover:bg-slate-800/20 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-emerald-400 font-semibold text-lg">{ann.corp_name}</span>
                                        <span className="text-white font-medium">{ann.report_nm}</span>
                                        <span className="text-slate-500 text-sm">{formatTime(ann.sent_at)} 발송 완료</span>
                                    </div>
                                    <a
                                        href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${ann.rcept_no}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 transition-all w-fit"
                                    >
                                        공시 보기
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </motion.li>
                            ))
                        )}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
}
