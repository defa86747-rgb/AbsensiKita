import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Loader2,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: teacherCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const { count: attendanceCount } = await supabase
        .from('student_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'hadir');

      const rate = studentCount ? Math.round(((attendanceCount || 0) / studentCount) * 100) : 0;

      setStats({
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        todayAttendance: attendanceCount || 0,
        attendanceRate: rate
      });

      setChartData([
        { name: 'Sen', hadir: 85, izin: 5, sakit: 5, alpa: 5 },
        { name: 'Sel', hadir: 88, izin: 4, sakit: 4, alpa: 4 },
        { name: 'Rab', hadir: 92, izin: 3, sakit: 3, alpa: 2 },
        { name: 'Kam', hadir: 90, izin: 4, sakit: 4, alpa: 2 },
        { name: 'Jum', hadir: 95, izin: 2, sakit: 2, alpa: 1 },
      ]);

    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Dashboard <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchStats}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          Refresh Analytics
        </motion.button>
      </div>

      {/* Bento Grid Stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={Users} 
          color="indigo" 
          trend="+2.4%"
          description="Active enrollment"
          variant={item}
        />
        <StatCard 
          title="Total Teachers" 
          value={stats.totalTeachers} 
          icon={UserCheck} 
          color="violet" 
          trend="Stable"
          description="Faculty members"
          variant={item}
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${stats.attendanceRate}%`} 
          icon={Calendar} 
          color="emerald" 
          trend="+5.2%"
          description="Today's presence"
          variant={item}
        />
        <StatCard 
          title="Absence Alert" 
          value={stats.totalStudents - stats.todayAttendance} 
          icon={AlertCircle} 
          color="rose" 
          trend="-1.2%"
          description="Needs attention"
          variant={item}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">Attendance Trends</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Weekly performance analysis</p>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hadir" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorHadir)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions / Info */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Insights</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Attendance is up by 5% this week. Great job on maintaining student engagement!
            </p>
            <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl text-sm font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2">
              View Full Report
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">New attendance recorded</p>
                    <p className="text-xs text-slate-500 mt-0.5">Class X-MIPA-1 • 2 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: number | string; 
  icon: any; 
  color: string; 
  trend: string;
  description: string;
  variant: any;
}> = ({ title, value, icon: Icon, color, trend, description, variant }) => {
  const colors: any = {
    indigo: "bg-indigo-600 shadow-indigo-100 text-indigo-600",
    violet: "bg-violet-600 shadow-violet-100 text-violet-600",
    emerald: "bg-emerald-600 shadow-emerald-100 text-emerald-600",
    rose: "bg-rose-600 shadow-rose-100 text-rose-600"
  };

  return (
    <motion.div 
      variants={variant}
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 group transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", colors[color].split(' ')[0])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-50 border border-slate-100", colors[color].split(' ')[2])}>
          {trend}
        </div>
      </div>
      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</h4>
      <p className="text-4xl font-extrabold text-slate-900 mt-2 font-display">{value}</p>
      <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        {description}
      </p>
    </motion.div>
  );
};

const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);
