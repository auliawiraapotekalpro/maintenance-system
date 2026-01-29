
import React, { useState } from 'react';
import { Ticket, RiskLevel, TicketStatus } from '../types';
import { ClipboardList, FileText, CheckCircle2, Clock, Upload, X, Eye, Send, ChevronDown, ImageIcon, AlertCircle } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  onAddTicket: (ticket: Partial<Ticket>) => void;
  storeName: string;
}

const PROBLEM_INDICATORS = [
  "Plafon roboh di area publik/apoteker, kabel terbakar, atau bocor tepat di atas stok obat mahal/kulkas vaksin.",
  "Bocor deras di area gudang/belakang, plafon melandai (tunggu roboh), air masuk ke area penjualan tapi belum mengenai stok.",
  "Rembesan air ( spotting), plafon berjamur, bocor hanya saat hujan sangat deras, area non-vital (toilet/parkir)."
];

const OutletDashboard: React.FC<Props> = ({ tickets, onAddTicket, storeName }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'monitor'>('create');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    storeName: storeName,
    reportDate: new Date().toISOString().split('T')[0],
    problemIndicator: '',
    photos: [] as string[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string]
          }));
        };
        reader.readAsDataURL(file as File);
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Risk Level and other assessments will now be filled by Admin
    onAddTicket({ 
      ...formData, 
      riskLevel: RiskLevel.LOW, // Default, to be updated by admin
      businessImpact: '',
      recommendation: '',
      storeName
    });
    
    setFormData({
      storeName: storeName,
      reportDate: new Date().toISOString().split('T')[0],
      problemIndicator: '',
      photos: []
    });

    // Tampilkan modal sukses dan pindah ke tab monitor
    setShowSuccessModal(true);
    setActiveTab('monitor');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <Clock size={12} /> PENDING
          </div>
        );
      case TicketStatus.PLANNED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle size={12} /> IN_PROGRESS
          </div>
        );
      case TicketStatus.FINISHED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} /> FINISHED
          </div>
        );
    }
  };

  const getRiskBadge = (risk: RiskLevel, ticketStatus: TicketStatus) => {
    if (ticketStatus === TicketStatus.PENDING) return <span className="text-slate-300 font-bold text-[10px]">-</span>;
    
    switch (risk) {
      case RiskLevel.CRITICAL:
        return <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-extrabold rounded uppercase">CRITICAL</span>;
      case RiskLevel.HIGH:
        return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-extrabold rounded uppercase">HIGH</span>;
      case RiskLevel.MEDIUM:
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-extrabold rounded uppercase">MEDIUM</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-extrabold rounded uppercase">LOW</span>;
    }
  };

  const myTickets = tickets.filter(t => t.storeName === storeName);

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm text-center relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Laporan Terkirim!</h3>
            <p className="text-slate-500 font-medium mb-8">Tiket pelaporan Anda telah berhasil masuk ke sistem maintenance.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-[#5a56e9] text-white font-bold rounded-2xl shadow-lg shadow-[#5a56e9]/30 hover:bg-[#4d49d9] transition-all"
            >
              Lihat Monitoring
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-1 inline-flex">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'create' ? 'bg-[#5a56e9] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ClipboardList size={20} />
            Isi Laporan
          </button>
          <button 
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'monitor' ? 'bg-[#5a56e9] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Eye size={20} />
            Monitoring Tiket
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-10 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Formulir Pelaporan Kerusakan Plafon</h2>
            <p className="text-slate-400 text-sm mt-1">Silakan lengkapi detail kerusakan untuk ditindaklanjuti oleh tim maintenance.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Nama Toko / Outlet</label>
                  <input 
                    type="text" 
                    value={storeName}
                    disabled
                    className="w-full px-5 py-4 bg-[#f1f5f9] border border-transparent rounded-2xl text-slate-400 font-bold cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 italic font-medium">* Terisi otomatis sesuai login</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Tanggal Pelaporan</label>
                  <input 
                    type="date" 
                    value={formData.reportDate}
                    onChange={(e) => setFormData({...formData, reportDate: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] outline-none font-medium text-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Indikator Masalah</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] outline-none font-medium text-slate-700 transition-all appearance-none pr-12"
                      value={formData.problemIndicator}
                      onChange={(e) => setFormData({...formData, problemIndicator: e.target.value})}
                      required
                    >
                      <option value="" disabled>-- Pilih Indikator Masalah --</option>
                      {PROBLEM_INDICATORS.map((indicator, idx) => (
                        <option key={idx} value={indicator}>{indicator}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Upload Foto (Dapat lebih dari 1)</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-slate-200 border-dashed rounded-3xl bg-[#f8faff] cursor-pointer hover:border-[#5a56e9] hover:bg-blue-50/50 transition-all group">
                       <Upload size={20} className="text-[#5a56e9] mb-1" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Tambah Foto</span>
                      <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>

                    {formData.photos.map((src, idx) => (
                      <div key={idx} className="relative w-28 h-28 rounded-3xl overflow-hidden border border-slate-200 group">
                        <img src={src} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex justify-end">
              <button type="submit" className="flex items-center justify-center gap-3 px-12 py-5 bg-[#5a56e9] text-white font-bold rounded-2xl shadow-xl shadow-[#5a56e9]/20 hover:bg-[#4d49d9] active:scale-[0.98] transition-all">
                <Send size={20} /> Kirim Laporan
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1800px] border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID TIKET</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">STATUS</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">NAMA TOKO</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">TGL LAPOR</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-96">INDIKATOR MASALAH</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">RESIKO</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-64">DAMPAK BISNIS</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-64">REKOMENDASI</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">BUKTI FOTO</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">DEPT</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">PIC</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">RENCANA TGL PENGERJAAN</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">TARGET SELESAI</th>
                    <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">TGL SELESAI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myTickets.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <FileText size={48} className="text-slate-300 mb-4" />
                          <p className="text-slate-500 font-bold">Belum ada riwayat pelaporan</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    myTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-8 font-bold text-[#5a56e9] text-sm">{ticket.id}</td>
                        <td className="px-6 py-8">{getStatusBadge(ticket.status)}</td>
                        <td className="px-6 py-8 font-bold text-slate-800 text-sm">{ticket.storeName}</td>
                        <td className="px-6 py-8 text-slate-500 text-sm whitespace-nowrap">{ticket.reportDate}</td>
                        <td className="px-6 py-8">
                          <div className="text-slate-600 text-sm leading-relaxed" title={ticket.problemIndicator}>
                            {ticket.problemIndicator}
                          </div>
                        </td>
                        <td className="px-6 py-8">{getRiskBadge(ticket.riskLevel, ticket.status)}</td>
                        <td className="px-6 py-8">
                          <div className="text-slate-500 text-sm italic leading-relaxed">
                            {ticket.businessImpact || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <div className="text-slate-600 text-sm font-medium leading-relaxed">
                            {ticket.recommendation || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center">
                          {ticket.photos.length > 0 ? (
                            <div className="flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 cursor-pointer">
                              <ImageIcon size={18} className="text-slate-400" />
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-8 text-slate-500 font-bold text-sm">{ticket.department || '-'}</td>
                        <td className="px-6 py-8 text-slate-800 font-bold text-sm uppercase">{ticket.picName || '-'}</td>
                        <td className="px-6 py-8 text-slate-500 text-sm font-medium">{ticket.plannedDate || '-'}</td>
                        <td className="px-6 py-8 text-slate-800 font-bold text-sm">{ticket.targetEndDate || '-'}</td>
                        <td className="px-6 py-8">
                          {ticket.actualFinishedDate ? (
                            <div className="flex flex-col">
                              <span className="text-emerald-600 font-bold text-sm">{ticket.actualFinishedDate}</span>
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Selesai</span>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100">
               <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                 * GESER KE SAMPING UNTUK MELIHAT DETAIL LENGKAP PENGERJAAN
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletDashboard;
