
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, RiskLevel } from '../types';
import { Send, CheckCircle2, AlertCircle, Calendar, User, Building, ShieldAlert, FileSearch, X, ImageIcon, ChevronDown, ListFilter } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  onUpdateTicket: (id: string, updates: Partial<Ticket>, isFinished?: boolean) => void;
  adminName: string;
}

const RISK_OPTIONS = [
  { label: 'P1 - CRITICAL', value: RiskLevel.CRITICAL },
  { label: 'P2 - HIGH', value: RiskLevel.HIGH },
  { label: 'P3 - MEDIUM', value: RiskLevel.MEDIUM },
];

const IMPACT_OPTIONS = [
  "Operasional berhenti sebagian/total, risiko cedera manusia, kerugian stok masif.",
  "Operasional terganggu, risiko kerusakan aset bangunan meningkat jika dibiarkan >24 jam.",
  "Estetika buruk, kenyamanan pelanggan terganggu, tapi bisnis tetap jalan."
];

const RECOMMENDATION_OPTIONS = [
  "pergantian plafon",
  "perbaikan sumber kebocoran (atap/pipa)",
  "pembersihan dan pengecetan ulang"
];

const DEPT_OPTIONS = [
  "sitedev",
  "GA",
  "septian",
  "hendri",
  "nerta lena",
  "susi"
];

const AdminDashboard: React.FC<Props> = ({ tickets, onUpdateTicket, adminName }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  
  const [responseForm, setResponseForm] = useState({
    department: '',
    picName: adminName,
    plannedDate: '',
    targetEndDate: '',
    riskLevel: RiskLevel.MEDIUM,
    businessImpact: '',
    recommendation: ''
  });

  // Keep PIC updated if login changes
  useEffect(() => {
    setResponseForm(prev => ({ ...prev, picName: adminName }));
  }, [adminName]);

  const handleResponseSubmit = (e: React.FormEvent, isFinished: boolean = false) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    if (!isFinished && (!responseForm.department || !responseForm.plannedDate || !responseForm.targetEndDate || !responseForm.businessImpact || !responseForm.recommendation)) {
      alert("Harap lengkapi semua field respon dan rencana pengerjaan.");
      return;
    }

    onUpdateTicket(selectedTicketId, responseForm, isFinished);
    setSelectedTicketId(null);
    setResponseForm({ 
      department: '', 
      picName: adminName, 
      plannedDate: '', 
      targetEndDate: '',
      riskLevel: RiskLevel.MEDIUM,
      businessImpact: '',
      recommendation: ''
    });
    
    if (isFinished) {
      setShowSuccessModal(true);
    } else {
      alert("Rencana pengerjaan berhasil dikirim ke outlet!");
    }
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING: 
        return { bg: 'bg-amber-50', text: 'text-amber-500', dot: 'bg-amber-500', label: 'PENDING' };
      case TicketStatus.PLANNED: 
        return { bg: 'bg-blue-50', text: 'text-blue-500', dot: 'bg-blue-500', label: 'IN PROGRESS' };
      case TicketStatus.FINISHED: 
        return { bg: 'bg-emerald-50', text: 'text-emerald-500', dot: 'bg-emerald-500', label: 'COMPLETED' };
      default: 
        return { bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-400', label: '-' };
    }
  };

  const filteredTickets = statusFilter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm text-center relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Pekerjaan Selesai!</h3>
            <p className="text-slate-500 font-medium mb-8">Status tiket telah diperbarui menjadi Completed dan tanggal selesai telah tercatat otomatis.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-[#5a56e9] text-white font-bold rounded-2xl shadow-lg shadow-[#5a56e9]/30 hover:bg-[#4d49d9] transition-all"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      )}

      {/* Filter Interactive Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
           <ListFilter size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Filter Status Tiket</span>
        </div>
        <div className="flex justify-center flex-wrap gap-4">
          {/* Filter ALL */}
          <button 
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-200 ${statusFilter === 'ALL' ? 'bg-slate-800 border-slate-800 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 shadow-sm'}`}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest">ALL</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${statusFilter === 'ALL' ? 'bg-white/20' : 'bg-slate-100'}`}>
              {tickets.length}
            </span>
          </button>

          {/* Filter PENDING */}
          <button 
            onClick={() => setStatusFilter(TicketStatus.PENDING)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-200 ${statusFilter === TicketStatus.PENDING ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100' : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200 shadow-sm'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${statusFilter === TicketStatus.PENDING ? 'bg-white' : 'bg-amber-500'}`}></div>
            <span className="text-[11px] font-bold uppercase tracking-widest">PENDING</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${statusFilter === TicketStatus.PENDING ? 'bg-white/20' : 'bg-amber-50'}`}>
              {tickets.filter(t => t.status === TicketStatus.PENDING).length}
            </span>
          </button>

          {/* Filter IN PROGRESS */}
          <button 
            onClick={() => setStatusFilter(TicketStatus.PLANNED)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-200 ${statusFilter === TicketStatus.PLANNED ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-100' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 shadow-sm'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${statusFilter === TicketStatus.PLANNED ? 'bg-white' : 'bg-blue-500'}`}></div>
            <span className="text-[11px] font-bold uppercase tracking-widest">IN PROGRESS</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${statusFilter === TicketStatus.PLANNED ? 'bg-white/20' : 'bg-blue-50'}`}>
              {tickets.filter(t => t.status === TicketStatus.PLANNED).length}
            </span>
          </button>

          {/* Filter COMPLETED */}
          <button 
            onClick={() => setStatusFilter(TicketStatus.FINISHED)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-200 ${statusFilter === TicketStatus.FINISHED ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 shadow-sm'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${statusFilter === TicketStatus.FINISHED ? 'bg-white' : 'bg-emerald-500'}`}></div>
            <span className="text-[11px] font-bold uppercase tracking-widest">COMPLETED</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${statusFilter === TicketStatus.FINISHED ? 'bg-white/20' : 'bg-emerald-50'}`}>
              {tickets.filter(t => t.status === TicketStatus.FINISHED).length}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <h3 className="text-2xl font-black text-slate-800 text-center mb-8">
          {statusFilter === 'ALL' ? 'Daftar Semua Tiket' : `Tiket Status: ${statusFilter.replace('_', ' ')}`}
        </h3>

        {filteredTickets.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
             <FileSearch size={64} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">Tidak ada tiket dengan status ini.</p>
             {statusFilter !== 'ALL' && (
               <button onClick={() => setStatusFilter('ALL')} className="mt-4 text-[#5a56e9] font-bold text-sm underline">Tampilkan Semua Tiket</button>
             )}
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusStyle = getStatusStyle(ticket.status);
            return (
              <div key={ticket.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
                {/* Card Header */}
                <div className="p-8 flex items-center justify-between border-b border-slate-50">
                  <div className="flex items-center gap-5">
                    {/* Icon Container with Dynamic Status Color */}
                    <div className={`w-14 h-14 ${statusStyle.bg} ${statusStyle.text} rounded-2xl flex items-center justify-center transition-colors duration-500`}>
                      <Building size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{ticket.storeName}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-0.5">
                        <span className="text-[#5a56e9] font-mono">{ticket.id}</span>
                        <span className="opacity-30">|</span>
                        <span>Lapor: {ticket.reportDate}</span>
                        <span className="opacity-30">|</span>
                        <span className={`${statusStyle.text} uppercase tracking-widest text-[9px]`}>{statusStyle.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {ticket.status !== TicketStatus.FINISHED && (
                      <button 
                        onClick={() => {
                          if (selectedTicketId === ticket.id) setSelectedTicketId(null);
                          else {
                            setSelectedTicketId(ticket.id);
                            setResponseForm({
                              department: ticket.department || '',
                              picName: adminName,
                              plannedDate: ticket.plannedDate || '',
                              targetEndDate: ticket.targetEndDate || '',
                              riskLevel: ticket.riskLevel || RiskLevel.MEDIUM,
                              businessImpact: ticket.businessImpact || '',
                              recommendation: ticket.recommendation || ''
                            });
                          }
                        }}
                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${selectedTicketId === ticket.id ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-[#5a56e9] hover:bg-indigo-100'}`}
                      >
                        {selectedTicketId === ticket.id ? 'Batal Respon' : 'Submit Rencana'}
                      </button>
                    )}
                    {ticket.status !== TicketStatus.FINISHED && (
                      <button 
                        onClick={(e) => {
                          const updates = selectedTicketId === ticket.id ? responseForm : {};
                          onUpdateTicket(ticket.id, updates, true);
                          setShowSuccessModal(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                      >
                        <CheckCircle2 size={18} />
                        Selesai
                      </button>
                    )}
                    {ticket.status === TicketStatus.FINISHED && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-xs uppercase tracking-widest">
                        <CheckCircle2 size={16} /> Completed
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">LAPORAN MASALAH (OUTLET)</label>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 font-bold italic leading-relaxed">
                        "{ticket.problemIndicator}"
                      </div>
                    </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">DOKUMENTASI FOTO</label>
                     <div className="grid grid-cols-2 gap-3">
                        {ticket.photos.length > 0 ? (
                          ticket.photos.map((p, i) => (
                            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <img src={p} className="w-full h-full object-cover" alt="Ticket" />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 aspect-[2/1] bg-slate-50 border border-slate-100 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-300">
                            <ImageIcon size={32} className="mb-2 opacity-30" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">NO FOTO</span>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Form Respon (Visible when clicked "Submit Rencana") */}
                {selectedTicketId === ticket.id && (
                  <div className="bg-indigo-50/50 p-8 border-t border-indigo-100 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-[#5a56e9] rounded-xl flex items-center justify-center text-white">
                        <Send size={18} />
                      </div>
                      <h5 className="text-lg font-black text-slate-800">Form Respon & Rencana Pengerjaan</h5>
                    </div>

                    <form onSubmit={(e) => handleResponseSubmit(e, false)} className="space-y-8">
                      {/* Row 1: Assessments */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Level Resiko</label>
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] outline-none font-bold text-sm transition-all"
                            value={responseForm.riskLevel}
                            onChange={(e) => setResponseForm({...responseForm, riskLevel: e.target.value as RiskLevel})}
                          >
                            {RISK_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Dampak Ke Bisnis</label>
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] outline-none font-medium text-xs transition-all"
                            value={responseForm.businessImpact}
                            onChange={(e) => setResponseForm({...responseForm, businessImpact: e.target.value})}
                            required
                          >
                            <option value="" disabled>-- Pilih Dampak Bisnis --</option>
                            {IMPACT_OPTIONS.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Rekomendasi Tindakan</label>
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] outline-none font-medium text-xs transition-all"
                            value={responseForm.recommendation}
                            onChange={(e) => setResponseForm({...responseForm, recommendation: e.target.value})}
                            required
                          >
                            <option value="" disabled>-- Pilih Rekomendasi --</option>
                            {RECOMMENDATION_OPTIONS.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Execution */}
                      <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Departement</label>
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] outline-none font-bold text-sm transition-all"
                            value={responseForm.department}
                            onChange={(e) => setResponseForm({...responseForm, department: e.target.value})}
                            required
                          >
                            <option value="" disabled>-- Dept --</option>
                            {DEPT_OPTIONS.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">PIC (Petugas)</label>
                          <input 
                            type="text" 
                            disabled
                            className="w-full px-5 py-4 bg-slate-100 border border-transparent rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed uppercase"
                            value={responseForm.picName}
                          />
                        </div>
                        <div className="flex-1 min-w-[150px] space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Tgl Mulai</label>
                          <input 
                            type="date" 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-[#5a56e9]/20 transition-all"
                            value={responseForm.plannedDate}
                            onChange={(e) => setResponseForm({...responseForm, plannedDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex-1 min-w-[150px] space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Tgl Target</label>
                          <input 
                            type="date" 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-[#5a56e9]/20 transition-all"
                            value={responseForm.targetEndDate}
                            onChange={(e) => setResponseForm({...responseForm, targetEndDate: e.target.value})}
                            required
                          />
                        </div>
                        <button 
                          type="submit"
                          className="flex items-center gap-2 px-10 py-4 bg-[#5a56e9] text-white rounded-2xl font-black text-sm hover:bg-[#4d49d9] shadow-xl shadow-[#5a56e9]/30 transition-all active:scale-95"
                        >
                          <Send size={18} />
                          SUBMIT RENCANA
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
