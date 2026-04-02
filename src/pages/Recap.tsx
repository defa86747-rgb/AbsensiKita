import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FileText, 
  Download, 
  Filter, 
  Loader2,
  Calendar as CalendarIcon,
  Users,
  UserCheck,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const Recap: React.FC = () => {
  const [type, setType] = useState<'student' | 'teacher'>('student');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecap();
  }, [type, month]);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(new Date(month));
      const end = endOfMonth(new Date(month));

      if (type === 'student') {
        const { data: attendanceData, error } = await supabase
          .from('student_attendance')
          .select(`
            status,
            date,
            students (name, nisn, class)
          `)
          .gte('date', format(start, 'yyyy-MM-dd'))
          .lte('date', format(end, 'yyyy-MM-dd'));

        if (error) throw error;

        // Group by student
        const grouped: Record<string, any> = {};
        attendanceData?.forEach((item: any) => {
          const studentId = item.students.nisn;
          if (!grouped[studentId]) {
            grouped[studentId] = {
              name: item.students.name,
              nisn: item.students.nisn,
              class: item.students.class,
              hadir: 0, sakit: 0, izin: 0, alpa: 0
            };
          }
          grouped[studentId][item.status]++;
        });
        setData(Object.values(grouped));
      } else {
        const { data: attendanceData, error } = await supabase
          .from('teacher_attendance')
          .select(`
            status,
            date,
            profiles (full_name, role)
          `)
          .gte('date', format(start, 'yyyy-MM-dd'))
          .lte('date', format(end, 'yyyy-MM-dd'));

        if (error) throw error;

        // Group by teacher
        const grouped: Record<string, any> = {};
        attendanceData?.forEach((item: any) => {
          const teacherName = item.profiles.full_name;
          if (!grouped[teacherName]) {
            grouped[teacherName] = {
              name: teacherName,
              role: item.profiles.role,
              hadir: 0, sakit: 0, izin: 0, alpa: 0
            };
          }
          grouped[teacherName][item.status]++;
        });
        setData(Object.values(grouped));
      }
    } catch (err) {
      console.error('Error fetching recap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Exporting to PDF... (Feature coming soon)');
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Attendance <span className="text-indigo-600">Recap</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Generate and analyze monthly attendance reports.</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <Download className="w-5 h-5" />
          Export Report
        </motion.button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm flex">
          <button 
            onClick={() => setType('student')}
            className={`flex-1 py-3 px-6 rounded-[1.5rem] text-sm font-bold transition-all ${
              type === 'student' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Students
          </button>
          <button 
            onClick={() => setType('teacher')}
            className={`flex-1 py-3 px-6 rounded-[1.5rem] text-sm font-bold transition-all ${
              type === 'teacher' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Teachers
          </button>
        </div>

        <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 px-8">
          <CalendarIcon className="w-5 h-5 text-slate-400" />
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 outline-none text-sm font-bold text-slate-600 cursor-pointer"
          />
        </div>

        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Total Records</p>
            <p className="text-2xl font-extrabold text-indigo-900">{data.length}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Entity Info</th>
                <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Hadir</th>
                <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Sakit</th>
                <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Izin</th>
                <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Alpa</th>
                <th className="px-10 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-slate-400 font-medium mt-4">Compiling report data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-medium">No records found for this period.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const total = item.hadir + item.sakit + item.izin + item.alpa;
                  const percentage = total > 0 ? Math.round((item.hadir / total) * 100) : 0;
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {type === 'student' ? `${item.class} • ${item.nisn}` : item.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{item.hadir}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">{item.sakit}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{item.izin}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">{item.alpa}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-sm font-extrabold ${percentage > 80 ? 'text-emerald-600' : percentage > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {percentage}%
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`h-full ${percentage > 80 ? 'bg-emerald-500' : percentage > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
