import React, { useEffect, useState } from 'react';
import { supabase, Student } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle,
  Loader2,
  Calendar as CalendarIcon,
  Search,
  Save,
  Filter,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const StudentAttendance: React.FC = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });
      
      if (studentError) throw studentError;
      setStudents(studentData || []);

      const uniqueClasses = Array.from(new Set((studentData || []).map(s => s.class)));
      setClasses(uniqueClasses);

      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('student_attendance')
        .select('student_id, status')
        .eq('date', today);

      if (attendanceError) throw attendanceError;

      const attendanceMap: Record<string, string> = {};
      attendanceData?.forEach(item => {
        attendanceMap[item.student_id] = item.status;
      });
      setAttendance(attendanceMap);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        teacher_id: profile?.id,
        date: today,
        status
      }));

      const { error: deleteError } = await supabase
        .from('student_attendance')
        .delete()
        .eq('date', today);
      
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('student_attendance')
        .insert(records);

      if (insertError) throw insertError;

      alert('Absensi berhasil disimpan!');
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Gagal menyimpan absensi');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua' || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const stats = {
    hadir: Object.values(attendance).filter(v => v === 'hadir').length,
    sakit: Object.values(attendance).filter(v => v === 'sakit').length,
    izin: Object.values(attendance).filter(v => v === 'izin').length,
    alpa: Object.values(attendance).filter(v => v === 'alpa').length,
    total: filteredStudents.length
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Absensi <span className="text-indigo-600">Siswa</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm mr-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-600">{stats.hadir} Hadir</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-600">{stats.total - stats.hadir} Absen</span>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || filteredStudents.length === 0}
            className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Submit Attendance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 px-6">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student by name or NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-sm font-medium text-slate-600"
          />
        </div>
        <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-3 px-6">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full outline-none text-sm font-bold text-slate-600 bg-transparent cursor-pointer"
          >
            <option value="Semua">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Student Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-400 font-medium animate-pulse">Loading student data...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => (
              <motion.div
                layout
                key={student.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xl shadow-inner">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{student.name}</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{student.class}</p>
                    </div>
                  </div>
                  {attendance[student.id] && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <StatusIcon 
                    active={attendance[student.id] === 'hadir'} 
                    onClick={() => handleStatusChange(student.id, 'hadir')}
                    icon={CheckCircle2}
                    label="H"
                    color="emerald"
                  />
                  <StatusIcon 
                    active={attendance[student.id] === 'sakit'} 
                    onClick={() => handleStatusChange(student.id, 'sakit')}
                    icon={HelpCircle}
                    label="S"
                    color="amber"
                  />
                  <StatusIcon 
                    active={attendance[student.id] === 'izin'} 
                    onClick={() => handleStatusChange(student.id, 'izin')}
                    icon={Clock}
                    label="I"
                    color="blue"
                  />
                  <StatusIcon 
                    active={attendance[student.id] === 'alpa'} 
                    onClick={() => handleStatusChange(student.id, 'alpa')}
                    icon={XCircle}
                    label="A"
                    color="rose"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

const StatusIcon: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string;
  color: 'emerald' | 'amber' | 'blue' | 'rose';
}> = ({ active, onClick, icon: Icon, label, color }) => {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100"
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all border-2 ${
        active 
          ? `${colors[color]} border-current shadow-md scale-105` 
          : "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? "animate-bounce" : ""}`} />
      <span className="text-[10px] font-extrabold">{label}</span>
    </button>
  );
};
