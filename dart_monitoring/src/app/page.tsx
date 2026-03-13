"use client";

import { motion } from "framer-motion";
import { Activity, Building2, Bell, ShieldBan, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [stats, setStats] = useState({ companies: 0, keywords: 0, notifications: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { count: companyCount } = await supabase.from("companies").select("*", { count: "exact", head: true });
      const { count: keywordCount } = await supabase.from("keywords").select("*", { count: "exact", head: true });
      const { count: notifCount } = await supabase.from("announcements").select("*", { count: "exact", head: true });

      setStats({
        companies: companyCount || 0,
        keywords: keywordCount || 0,
        notifications: notifCount || 0,
      });
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: "모니터링 기업",
      value: stats.companies,
      icon: Building2,
      color: "text-blue-400",
      bgClass: "from-blue-500/10 to-transparent",
      link: "/companies"
    },
    {
      title: "제외 키워드",
      value: stats.keywords,
      icon: ShieldBan,
      color: "text-purple-400",
      bgClass: "from-purple-500/10 to-transparent",
      link: "/keywords"
    },
    {
      title: "발송된 알림",
      value: stats.notifications,
      icon: Bell,
      color: "text-green-400",
      bgClass: "from-green-500/10 to-transparent",
      link: "/notifications"
    }
  ];

  return (
    <main className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen flex flex-col pt-20">

      {/* Header section with premium animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            DART <span className="text-gradient">스마트 알림</span>
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          신용평가 실무자를 위한 맞춤형 DART 전자공시 모니터링 시스템입니다.
          중요하지 않은 단순 지분 공시는 <span className="text-purple-400 font-medium">자동으로 걸러내고</span> 중요한 핵심 공시만 텔레그램으로 즉시 받아보세요.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        {cards.map((card, idx) => (
          <Link href={card.link} key={idx} className="block group">
            <div className={`glass-card p-8 rounded-3xl relative overflow-hidden h-full flex flex-col border border-slate-800 hover:border-slate-600 transition-all duration-300`}>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.bgClass} rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-300 font-medium text-lg">{card.title}</h3>
                <card.icon className={`w-6 h-6 ${card.color} opacity-80`} />
              </div>

              <div className="mt-auto flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-white">{card.value}</span>
                <span className="text-slate-500 font-medium">건</span>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="glass-panel p-8 rounded-3xl border border-slate-800"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              시스템 가동 상태
            </h2>
            <p className="text-slate-400">
              텔레그램 봇과 자동 감지 시스템이 정상적으로 연결되어 있습니다.
              설정된 조건에 맞춰 백그라운드에서 DART 공시를 24시간 모니터링합니다.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 font-medium font-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              모니터링 작동 중
            </div>
          </div>
        </div>
      </motion.div>

    </main>
  );
}
