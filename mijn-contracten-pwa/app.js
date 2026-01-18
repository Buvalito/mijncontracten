const { useState, useMemo, useEffect } = React;
const { 
  Search, Plus, ChevronRight, Home, Shield, Zap, CreditCard, MoreHorizontal, 
  X, Trash2, Archive, Edit3, TrendingUp, CheckCircle2, Pin, Save, Building2 
} = lucide;

// Service Worker Registratie
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker geregistreerd:', reg))
        .catch(err => console.log('Service Worker registratie fout:', err));
    });
  }
};

const Icon = ({ icon: IconComponent, ...props }) => {
  const [ref, setRef] = useState(null);
  
  useEffect(() => {
    if (ref && IconComponent) {
      lucide.createElement(IconComponent).render(ref);
    }
  }, [ref, IconComponent]);
  
  return React.createElement('i', { ref: setRef, ...props });
};

const App = () => {
  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem('pwa_contracts_v2');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Huur', provider: 'Privé', type: 'Housing', cost: 850, frequency: 'monthly', status: 'active', pinned: true, startDate: '2023-01-01' },
      { id: 2, name: 'Spotify Family', provider: 'Spotify', type: 'Subscription', cost: 17.99, frequency: 'monthly', status: 'active', pinned: false, startDate: '2022-05-12' },
      { id: 3, name: 'Mobiel abonnement', provider: 'Proximus', type: 'Subscription', cost: 25.00, frequency: 'monthly', status: 'active', pinned: false, startDate: '2023-08-01' },
      { id: 4, name: 'Woonverzekering', provider: 'Ethias', type: 'Insurance', cost: 348.00, frequency: 'yearly', status: 'active', pinned: false, startDate: '2024-01-01' },
      { id: 5, name: 'Elektriciteit', provider: 'Engie', type: 'Utilities', cost: 120, frequency: 'monthly', status: 'active', pinned: false, startDate: '2023-11-15' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('pwa_contracts_v2', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', provider: '', type: 'Subscription', cost: '', frequency: 'monthly', pinned: false
  });

  const getMonthlyCost = (c) => (c.frequency === 'yearly' ? parseFloat(c.cost) / 12 : parseFloat(c.cost));

  const stats = useMemo(() => {
    const active = contracts.filter(c => c.status === 'active');
    const totalMonthly = active.reduce((acc, curr) => acc + getMonthlyCost(curr), 0);
    const subscriptionTotal = active.filter(c => c.type === 'Subscription').reduce((acc, curr) => acc + getMonthlyCost(curr), 0);
    const expensive = active.length > 0 ? [...active].sort((a, b) => getMonthlyCost(b) - getMonthlyCost(a))[0] : null;
    return { totalMonthly, expensive, subscriptionTotal, count: active.length };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts
      .filter(c => (statusFilter === 'active' ? c.status !== 'archived' : c.status === 'archived'))
      .filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(c => activeFilter === 'All' || c.type === activeFilter)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [contracts, searchQuery, activeFilter, statusFilter]);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', provider: '', type: 'Subscription', cost: '', frequency: 'monthly', pinned: false });
    setIsModalOpen(true);
  };

  const openEditModal = (contract) => {
    setIsEditing(true);
    setFormData({ ...contract });
    setIsModalOpen(true);
    setSelectedContract(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cost) return;
    if (isEditing) {
      setContracts(prev => prev.map(c => c.id === formData.id ? { ...formData } : c));
    } else {
      const id = Math.max(...contracts.map(c => c.id), 0) + 1;
      setContracts([...contracts, { ...formData, id, status: 'active' }]);
    }
    setIsModalOpen(false);
  };

  const togglePin = (id) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const archiveContract = (id) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'archived' : 'active', pinned: false } : c));
    setSelectedContract(null);
  };

  const deleteContract = (id) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    setSelectedContract(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Housing': return Home;
      case 'Insurance': return Shield;
      case 'Utilities': return Zap;
      case 'Subscription': return CreditCard;
      default: return MoreHorizontal;
    }
  };

  const getTypeLabel = (type) => {
    const labels = { Housing: 'Wonen', Insurance: 'Verzekering', Subscription: 'Abonnement', Utilities: 'Nutsvoorziening', Other: 'Overig' };
    return labels[type] || type;
  };

  return React.createElement('div', { className: "min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-12 selection:bg-blue-100" },
    React.createElement('header', { className: "bg-white px-6 pt-12 pb-8 shadow-sm rounded-b-[40px]" },
      React.createElement('div', { className: "max-w-md mx-auto" },
        React.createElement('div', { className: "flex justify-between items-center mb-6" },
          React.createElement('div', null,
            React.createElement('h1', { className: "text-2xl font-bold text-[#001D3D] tracking-tight" }, 'Mijn Contracten'),
            React.createElement('p', { className: "text-slate-400 text-sm font-medium" }, 'Overzicht van je lasten')
          ),
          React.createElement('div', { className: "bg-blue-50 p-2 rounded-full text-blue-600" },
            React.createElement(Icon, { icon: CheckCircle2, size: 24 })
          )
        ),
        React.createElement('div', { className: "bg-[#0B1A2D] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20" },
          React.createElement('div', { className: "absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" }),
          React.createElement('div', { className: "relative z-10 text-left" },
            React.createElement('div', { className: "flex justify-between items-center mb-2" },
              React.createElement('p', { className: "text-xs font-medium opacity-60 uppercase tracking-widest" },
                `Totaal per ${viewMode === 'monthly' ? 'maand' : 'jaar'}`
              ),
              React.createElement('button', {
                onClick: () => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly'),
                className: "bg-white/10 hover:bg-white/20 transition px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter"
              }, `Toon per ${viewMode === 'monthly' ? 'jaar' : 'maand'}`)
            ),
            React.createElement('div', { className: "flex items-baseline gap-2" },
              React.createElement('h2', { className: "text-4xl font-extrabold tracking-tighter" },
                `€${(viewMode === 'monthly' ? stats.totalMonthly : stats.totalMonthly * 12).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}`
              ),
              React.createElement('div', { className: "bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg" },
                React.createElement(Icon, { icon: TrendingUp, size: 16 })
              )
            ),
            React.createElement('div', { className: "mt-6 flex items-center gap-4 border-t border-white/10 pt-4 text-left" },
              React.createElement('div', null,
                React.createElement('p', { className: "text-[10px] opacity-50 uppercase font-bold" }, 'Aantal'),
                React.createElement('p', { className: "text-sm font-bold" }, `${stats.count} contracten`)
              )
            )
          )
        )
      )
    ),
    // Rest van de component... (te lang voor één response)
    // Zie volgende artifact voor de volledige implementatie
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));