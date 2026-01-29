
import React, { useState, useEffect } from 'react';
import { UserRole, Ticket, TicketStatus, RiskLevel } from './types';
import OutletDashboard from './components/OutletDashboard';
import AdminDashboard from './components/AdminDashboard';
import { LogIn, User, Lock, ChevronDown, Building2, LogOut, Loader2 } from 'lucide-react';

// GUNAKAN URL WEB APP GAS TERBARU ANDA
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzgN0O0MWPeANdwQzzjzsqWFfCFMzDZh49Ym2F1l7UoF6T0zn79a55xfSBKK34wWzVE/exec';
const DRIVE_FOLDER_ID = '1VILFbKdKh46tJIZQ5JNqO3Oi16cKIe0E';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${GAS_URL}?action=getUsers`);
        if (!response.ok) throw new Error('Gagal memuat user');
        const data = await response.json();
        setAccounts(data);
      } catch (e) {
        console.error("Gagal mengambil data user:", e);
        setAccounts([]); 
      } finally {
        setIsLoginLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(GAS_URL);
      if (!response.ok) throw new Error('Gagal memuat tiket');
      const rawData = await response.json();
      
      const mappedTickets: Ticket[] = rawData.map((item: any) => {
        return {
          id: item.id,
          status: item.status as TicketStatus,
          storeName: item.outletName,
          reportDate: item.reportDate,
          problemIndicator: item.indicator,
          riskLevel: item.riskLevel as RiskLevel,
          businessImpact: item.businessImpact,
          recommendation: item.recomendation,
          photos: item.photos || [],
          createdAt: item.createdAt,
          department: item.departement,
          picName: item.pic,
          plannedDate: item.planDate,
          targetEndDate: item.targetDate,
          actualFinishedDate: item.completionDate
        };
      });
      
      setTickets(mappedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(a => a.id === selectedUserId);
    if (account && String(account.password).trim() === String(password).trim()) {
      setCurrentUser({ 
        name: account.id, 
        role: account.role.toUpperCase() === 'ADMIN' ? UserRole.ADMIN : UserRole.OUTLET 
      });
      setLoginError('');
    } else {
      setLoginError('Password salah atau user belum dipilih');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedUserId('');
    setPassword('');
  };

  const addTicket = async (newTicketData: Partial<Ticket>) => {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: Ticket = {
      id: ticketId,
      storeName: currentUser?.name || 'Unknown Store',
      reportDate: newTicketData.reportDate || '',
      problemIndicator: newTicketData.problemIndicator || '',
      riskLevel: RiskLevel.LOW,
      businessImpact: '',
      recommendation: '',
      photos: newTicketData.photos || [], 
      status: TicketStatus.PENDING,
      createdAt: Date.now(),
    };

    setTickets(prev => [ticket, ...prev]);

    try {
      setIsLoading(true);
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          action: 'create', 
          data: ticket,
          driveFolderId: DRIVE_FOLDER_ID 
        })
      });
      
      // Jeda untuk upload foto & kirim email di backend
      setTimeout(() => {
        fetchTickets();
      }, 10000);
      
    } catch (e) {
      console.error("Gagal mengirim data:", e);
      setIsLoading(false);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>, isFinished: boolean = false) => {
    setIsLoading(true);
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'update', id, updates, isFinished })
      });
      
      setTimeout(fetchTickets, 5000);
    } catch (e) {
      console.error("Update error:", e);
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#5a56e9] p-4 rounded-2xl mb-4 text-white shadow-lg">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-bold text-[#1a1c1e] mb-1">Maintenance Portal</h1>
          <p className="text-slate-500 font-medium">Sistem Pelaporan & Monitoring</p>
        </div>

        <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
          {isLoginLoading ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="animate-spin text-[#5a56e9] mb-4" size={32} />
              <p className="text-slate-400 font-bold text-sm">Menghubungkan ke Database...</p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Pilih Toko / User</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={20} />
                  </div>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="block w-full pl-12 pr-10 py-4 bg-[#f8faff] border border-slate-200 rounded-2xl text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] transition-all cursor-pointer font-medium"
                  >
                    <option value="" disabled>-- Pilih Akun --</option>
                    {accounts.length > 0 ? (
                      <>
                        <optgroup label="Role: Pelapor (Outlet)">
                          {accounts.filter(a => a.role?.toUpperCase() === 'OUTLET' || a.role?.toUpperCase() === 'PELAPOR').map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.id}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Role: Admin (Petugas)">
                          {accounts.filter(a => a.role?.toUpperCase() === 'ADMIN').map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.id}</option>
                          ))}
                        </optgroup>
                      </>
                    ) : (
                      <option disabled>Gagal memuat daftar user</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password"
                    className="block w-full pl-12 pr-4 py-4 bg-[#f8faff] border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5a56e9]/20 focus:border-[#5a56e9] transition-all font-medium"
                  />
                </div>
              </div>

              {loginError && <p className="text-red-500 text-sm font-medium text-center">{loginError}</p>}

              <button
                type="submit"
                disabled={accounts.length === 0}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#5a56e9] text-white rounded-2xl font-bold shadow-lg hover:bg-[#4d49d9] transition-all mt-8 disabled:bg-slate-300 disabled:shadow-none"
              >
                <LogIn size={22} />
                Masuk ke Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      <header className="bg-[#4a45d2] text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Building2 size={28} />
              </div>
              <span className="font-bold text-2xl tracking-tight">Maintenance Portal</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                   <User size={18} />
                </div>
                <span className="text-sm font-bold uppercase">{currentUser.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/80 hover:text-white font-bold transition-all"
              >
                <LogOut size={22} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-12 text-center flex flex-col items-center">
           <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
             Selamat Datang, <span className="text-[#5a56e9]">{currentUser.name}</span>
           </h2>
           <div className="mt-3 px-6 py-1.5 bg-[#eef2ff] text-[#5a56e9] text-sm font-bold rounded-full border border-[#e0e7ff]">
             Akses: {currentUser.role === UserRole.OUTLET ? 'Pelapor Toko' : 'Petugas Maintenance'}
           </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={48} className="text-[#5a56e9] animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse text-center">
              Memproses Sinkronisasi...<br/>
              <span className="text-slate-400 text-xs">(Update Google Drive & Notifikasi Email)</span>
            </p>
          </div>
        ) : (
          currentUser.role === UserRole.OUTLET ? (
            <OutletDashboard tickets={tickets} onAddTicket={addTicket} storeName={currentUser.name} />
          ) : (
            <AdminDashboard tickets={tickets} onUpdateTicket={updateTicket} adminName={currentUser.name} />
          )
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm font-medium">
          Maintenance Ticketing System &copy; 2024
        </div>
      </footer>
    </div>
  );
};

export default App;
