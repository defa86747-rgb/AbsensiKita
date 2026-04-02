import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle,
  Loader2,
  Calendar as CalendarIcon,
  History,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const TeacherAttendance: React.FC = () => {
  const { profile } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchTodayStatus();
    fetchHistory();
  }, [profile]);

  const fetchTodayStatus = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('status')
        .eq('teacher_id', profile.id)
        .eq('date', today)
        .single();

      if (data) setStatus(data.status);
    } catch (err) {
      console.error('Error fetching today status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (data) setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleStatusSubmit = async (selectedStatus: string) => {
    if (!profile) return;
    try {
      setSaving(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error: deleteError } = await supabase
        .from('teacher_attendance')
        .delete()
        .eq('teacher_id', profile.id)
        .eq('date', today);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('teacher_attendance')
        .insert({
          teacher_id: profile.id,
          date: today,
          status: selectedStatus
        });

      if (insertError) throw insertError;

      setStatus(selectedStatus);
      fetchHistory();
      alert('Kehadiran Anda berhasil dicatat!');
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Gagal mencatat kehadiran');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Self <span className="text-indigo-600">Attendance</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium flex items-center justify-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Selection */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <h3 className="text-xl font-bold text-slate-900 mb-8 relative">How are you today?</h3>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatusCard 
                active={status === 'hadir'} 
                onClick={() => handleStatusSubmit('hadir')}
                icon={CheckCircle2}
                label="Hadir"
                description="Present & Ready"
                color="emerald"
                disabled={saving}
              />
              <StatusCard 
                active={status === 'sakit'} 
                onClick={() => handleStatusSubmit('sakit')}
                icon={HelpCircle}
                label="Sakit"
                description="Feeling Unwell"
                color="amber"
                disabled={saving}
              />
              <StatusCard 
                active={status === 'izin'} 
                onClick={() => handleStatusSubmit('izin')}
                icon={Clock}
                label="Izin"
                description="On Leave"
                color="blue"
                disabled={saving}
              />
              <StatusCard 
                active={status === 'alpa'} 
                onClick={() => handleStatusSubmit('alpa')}
                icon={XCircle}
                label="Alpa"
                description="Absent"
                color="rose"
                disabled={saving}
              />
            </div>
          )}

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <p className="text-sm font-bold text-emerald-700">
                You are marked as <span className="uppercase">{status}</span> today.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
          
          <div className="flex items-center gap-3 mb-8">
            <History className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold">Recent History</h3>
          </div>

          <div className="space-y-4 relative">
            <AnimatePresence>
              {history.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No history available yet.</p>
              ) : (
                history.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold">{format(new Date(item.date), 'dd MMMM yyyy', { locale: id })}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Daily Check-in</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      item.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.status === 'sakit' ? 'bg-amber-500/20 text-amber-400' :
                      item.status === 'izin' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.status}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatusCard: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string;
  description: string;
  color: 'emerald' | 'amber' | 'blue' | 'rose';
  disabled?: boolean;
}> = ({ active, onClick, icon: Icon, label, description, color, disabled }) => {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center text-center gap-2 p-6 rounded-[2rem] transition-all border-2 group ${
        active 
          ? `${colors[color]} border-current shadow-xl scale-105 z-10` 
          : "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
      } disabled:opacity-50`}
    >
      <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${active ? 'bg-current text-white' : 'bg-white shadow-sm'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-extrabold">{label}</p>
        <p className="text-[10px] font-medium opacity-60 mt-0.5">{description}</p>
      </div>
    </button>
  );
};
