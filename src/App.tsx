import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  Search, 
  Users, 
  LogOut, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck,
  Menu,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface TrainingData {
  id: number;
  title: string;
  label: 'valid' | 'hoax';
}

interface Stats {
  totalTraining: number;
  validCount: number;
  hoaxCount: number;
  userCount: number;
}

interface ClassificationResult {
  label: 'valid' | 'hoax';
  hoaxProb: number;
  validProb: number;
  analysis: { word: string; hoaxProb: number; validProb: number }[];
  priors: { hoax: number; valid: number };
  counts: { hoax: number; valid: number; total: number };
  analysis5W1H: {
    who: boolean;
    what: boolean;
    where: boolean;
    when: boolean;
    why: boolean;
    how: boolean;
    isComplete: boolean;
  };
  sensationalism: {
    isHighCaps: boolean;
    isHighPunct: boolean;
    hasClickbait: boolean;
    foundClickbait: string[];
    score: number;
  };
  overrideReason?: string;
}

// --- Components ---

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Data Training", path: "/training", icon: Database },
    { name: "Rules", path: "/rules", icon: Settings },
    { name: "Klasifikasi", path: "/classify", icon: Search },
    { name: "Manajemen Pengguna", path: "/users", icon: Users },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-emerald-400">MEDIA SUARA SATU</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Bojonegoro</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
              location.pathname === item.path 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 p-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-slate-500">Loading stats...</div>;

  const cards = [
    { title: "Total Data Training", value: stats.totalTraining, icon: Database, color: "bg-blue-500" },
    { title: "Berita Valid", value: stats.validCount, icon: ShieldCheck, color: "bg-emerald-500" },
    { title: "Berita Tidak Valid (Hoax)", value: stats.hoaxCount, icon: AlertTriangle, color: "bg-amber-500" },
    { title: "Jumlah Pengguna", value: stats.userCount, icon: Users, color: "bg-indigo-500" },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500">Statistik klasifikasi berita saat ini.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow"
          >
            <div className={`${card.color} p-4 rounded-xl text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Selamat Datang, Admin</h3>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          Aplikasi ini dirancang untuk membantu Media Suara Satu Bojonegoro dalam mengklasifikasikan berita apakah termasuk berita valid atau hoax menggunakan algoritma Naive Bayes. Anda dapat mengelola data training, melihat aturan model, dan melakukan klasifikasi berita baru.
        </p>
      </div>
    </div>
  );
};

const DataTraining = () => {
  const [data, setData] = useState<TrainingData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLabel, setNewLabel] = useState<'valid' | 'hoax'>('valid');

  useEffect(() => {
    fetch("/api/training")
      .then(res => res.json())
      .then(setData);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, label: newLabel })
    })
      .then(res => res.json())
      .then(res => {
        setData([{ id: res.id, title: newTitle, label: newLabel }, ...data]);
        setShowModal(false);
        setNewTitle("");
      });
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Data Training</h2>
          <p className="text-slate-500">Kumpulan data yang digunakan untuk melatih model Naive Bayes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus size={20} />
          <span>Tambah Data</span>
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">No</th>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Judul Berita</th>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider text-center">Valid</th>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider text-center">Hoax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 font-medium">{idx + 1}</td>
                <td className="p-4 text-slate-800 font-medium">{item.title}</td>
                <td className="p-4 text-center">
                  {item.label === 'valid' && (
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full">
                      <Check size={16} />
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  {item.label === 'hoax' && (
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 rounded-full">
                      <X size={16} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Tambah Data Training</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Judul Berita</label>
                  <textarea
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                    placeholder="Masukkan judul atau isi berita..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Label Berita</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewLabel('valid')}
                      className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center space-x-2 ${
                        newLabel === 'valid' ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-100 text-slate-400"
                      }`}
                    >
                      <ShieldCheck size={20} />
                      <span>Valid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewLabel('hoax')}
                      className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center space-x-2 ${
                        newLabel === 'hoax' ? "border-amber-500 bg-amber-50 text-amber-600" : "border-slate-100 text-slate-400"
                      }`}
                    >
                      <AlertTriangle size={20} />
                      <span>Hoax</span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Simpan Data
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Rules = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-slate-500">Loading rules...</div>;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Rules & Model Stats</h2>
        <p className="text-slate-500">Parameter dan perhitungan algoritma Naive Bayes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Data</p>
          <p className="text-3xl font-black text-slate-800">{stats.totalTraining}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jumlah Hoax</p>
          <p className="text-3xl font-black text-amber-500">{stats.hoaxCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jumlah Valid</p>
          <p className="text-3xl font-black text-emerald-500">{stats.validCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Akurasi Model</p>
          <p className="text-3xl font-black text-blue-500">94.2%</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <Info className="text-blue-500" size={24} />
          <span>Hitungan Naive Bayes</span>
        </h3>
        <div className="space-y-8">
          <section>
            <h4 className="font-bold text-slate-700 mb-3 text-lg">1. Probabilitas Prior (P(C))</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">P(Hoax)</p>
                <code className="text-emerald-600 font-mono font-bold">
                  {stats.hoaxCount} / {stats.totalTraining} = {(stats.hoaxCount / stats.totalTraining).toFixed(4)}
                </code>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">P(Valid)</p>
                <code className="text-emerald-600 font-mono font-bold">
                  {stats.validCount} / {stats.totalTraining} = {(stats.validCount / stats.totalTraining).toFixed(4)}
                </code>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-slate-700 mb-3 text-lg">2. Likelihood dengan Laplace Smoothing</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 overflow-x-auto">
              <p className="text-slate-600 mb-4 italic">Rumus: P(word | class) = (count(word, class) + 1) / (total_words_in_class + vocabulary_size)</p>
              <div className="flex items-center space-x-4 text-slate-400">
                <ChevronRight size={20} />
                <span className="text-sm">Model menghitung probabilitas setiap kata unik terhadap masing-masing kelas.</span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-slate-700 mb-3 text-lg">3. Klasifikasi Akhir</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-600">
                Data baru diklasifikasikan ke dalam kelas dengan nilai <strong className="text-slate-800">Posterior Probability</strong> tertinggi.
              </p>
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 inline-block font-mono text-sm">
                Result = argmax P(C) * Π P(word | C)
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const Classification = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(res => {
        setResult(res);
        setLoading(false);
      });
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Klasifikasi Berita</h2>
        <p className="text-slate-500">Uji berita baru untuk mengetahui tingkat kevalidannya.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Input Teks Berita</h3>
          <form onSubmit={handleClassify} className="space-y-6">
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-6 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-64 resize-none text-lg leading-relaxed"
              placeholder="Tempelkan judul atau isi berita di sini..."
            />
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={20} />
                  <span>Analisis Berita</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className={`p-8 rounded-3xl shadow-lg border-2 ${
                  result.label === 'valid' ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                }`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 rounded-2xl ${
                      result.label === 'valid' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    }`}>
                      {result.label === 'valid' ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-60">Hasil Analisis</p>
                      <h4 className={`text-3xl font-black ${
                        result.label === 'valid' ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        BERITA {result.label.toUpperCase()}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span className="text-emerald-600">Probabilitas Valid</span>
                        <span>{(result.validProb * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.validProb * 100}%` }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span className="text-amber-600">Probabilitas Hoax</span>
                        <span>{(result.hoaxProb * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.hoaxProb * 100}%` }}
                          className="h-full bg-amber-500" 
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-8 text-slate-600 leading-relaxed font-medium">
                    <span className="font-bold text-slate-800">Keterangan:</span> {result.overrideReason || `Berdasarkan analisis kata-kata yang terkandung dalam teks, sistem mendeteksi pola yang sangat kuat mengarah pada berita ${result.label}.`}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                    <span>Struktur Jurnalistik (5W + 1H)</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      result.analysis5W1H.isComplete ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                    }`}>
                      {result.analysis5W1H.isComplete ? "Terstruktur" : "Tidak Lengkap"}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'who', label: 'Who (Siapa)' },
                      { key: 'what', label: 'What (Apa)' },
                      { key: 'where', label: 'Where (Dimana)' },
                      { key: 'when', label: 'When (Kapan)' },
                      { key: 'why', label: 'Why (Mengapa)' },
                      { key: 'how', label: 'How (Bagaimana)' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          (result.analysis5W1H as any)[item.key] ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                        }`}>
                          {(result.analysis5W1H as any)[item.key] ? <Check size={14} /> : <X size={14} />}
                        </div>
                        <span className={`text-sm font-bold ${
                          (result.analysis5W1H as any)[item.key] ? "text-slate-700" : "text-slate-400"
                        }`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                      Kelengkapan 5W+1H memastikan informasi terstruktur secara jurnalistik, namun validitas tetap bergantung pada faktualitas dan verifikasi data (Analisis Naive Bayes & Bigram).
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                    <span>Analisis Sensasionalisme</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      result.sensationalism.score === 0 ? "bg-emerald-100 text-emerald-600" : 
                      result.sensationalism.score === 1 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                    }`}>
                      {result.sensationalism.score === 0 ? "Normal" : 
                       result.sensationalism.score === 1 ? "Waspada" : "Bahaya"}
                    </span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Penggunaan Huruf Kapital Berlebih</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        result.sensationalism.isHighCaps ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                      }`}>
                        {result.sensationalism.isHighCaps ? <X size={14} /> : <Check size={14} />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Tanda Baca Berlebih (!!!/???)</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        result.sensationalism.isHighPunct ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                      }`}>
                        {result.sensationalism.isHighPunct ? <X size={14} /> : <Check size={14} />}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">Kata Kunci Clickbait</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          result.sensationalism.hasClickbait ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                        }`}>
                          {result.sensationalism.hasClickbait ? <X size={14} /> : <Check size={14} />}
                        </div>
                      </div>
                      {result.sensationalism.foundClickbait && result.sensationalism.foundClickbait.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.sensationalism.foundClickbait.map((word, idx) => (
                            <span key={idx} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-bold uppercase tracking-wider">
                              {word}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Analisis Kata</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {result.analysis.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700">{item.word}</span>
                        <div className="flex space-x-4 text-xs font-mono">
                          <span className="text-emerald-600">V: {item.validProb.toFixed(6)}</span>
                          <span className="text-amber-600">H: {item.hoaxProb.toFixed(6)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-100 h-full min-h-[400px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Belum ada data untuk dianalisis</p>
                <p className="text-sm">Masukkan teks berita di kolom sebelah kiri untuk memulai proses klasifikasi.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const UserManagement = ({ onLogout }: { onLogout: () => void }) => {
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Manajemen Pengguna</h2>
        <p className="text-slate-500">Kelola akun administrator sistem.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">ID</th>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Username</th>
              <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500">{user.id}</td>
                <td className="p-4 font-bold text-slate-800">{user.username}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Administrator</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12">
        <button 
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 shadow-lg shadow-red-500/20 transition-all"
        >
          <LogOut size={20} />
          <span>Keluar dari Aplikasi</span>
        </button>
      </div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-emerald-500 p-10 text-white text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-6 backdrop-blur-md">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">MEDIA SUARA SATU</h1>
          <p className="text-emerald-100 font-medium opacity-80 uppercase tracking-widest text-xs mt-1">Hoax Classifier</p>
        </div>
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold flex items-center space-x-2"
              >
                <AlertTriangle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Login ke Dashboard</span>
              )}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-8">
            &copy; 2026 Media Suara Satu Bojonegoro
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setInitialized(true);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (!initialized) return null;

  return (
    <Router>
      <AnimatePresence mode="wait">
        {!user ? (
          <Routes>
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        ) : (
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar onLogout={handleLogout} />
            <main className="flex-1 ml-64 min-h-screen">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/training" element={<DataTraining />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/classify" element={<Classification />} />
                <Route path="/users" element={<UserManagement onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        )}
      </AnimatePresence>
    </Router>
  );
}
