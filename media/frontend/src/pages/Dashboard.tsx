import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../services/api.js';
import { MediaRecord, FilterFacets } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
  Tv,
  Users,
  Truck,
  FileVideo,
  Calendar,
  CheckCircle2,
  Receipt,
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  FileDown,
  Eye,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { isReadOnly, user } = useAuth();
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [facets, setFacets] = useState<FilterFacets | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters State (Kaggle Style)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedContent, setSelectedContent] = useState('');
  const [monthFilterMode, setMonthFilterMode] = useState<'single' | 'multi' | 'range'>('single');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    clientId: '',
    supplierId: '',
    channelId: '',
    contentId: '',
    month: 'يناير 2026',
    netToChannel: 0,
    netToClient: 0,
    notes: '',
    status: 'PLANNED',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch filter facets
  const fetchFacets = async () => {
    const res = await apiRequest<FilterFacets>('/records/filter-facets');
    if (res.success && res.data) {
      setFacets(res.data);
    }
  };

  // Fetch records with query params
  const fetchRecords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedClient) params.append('clientId', selectedClient);
    if (selectedSupplier) params.append('supplierId', selectedSupplier);
    if (selectedChannel) params.append('channelId', selectedChannel);
    if (selectedContent) params.append('contentId', selectedContent);

    if (monthFilterMode === 'single' && selectedMonth) {
      params.append('month', selectedMonth);
    } else if (monthFilterMode === 'multi' && selectedMonths.length > 0) {
      params.append('months', selectedMonths.join(','));
    } else if (monthFilterMode === 'range') {
      if (fromMonth) params.append('fromMonth', fromMonth);
      if (toMonth) params.append('toMonth', toMonth);
    }

    const res = await apiRequest<MediaRecord[]>(`/records?${params.toString()}`);
    if (res.success && res.data) {
      setRecords(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFacets();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [
    selectedClient,
    selectedSupplier,
    selectedChannel,
    selectedContent,
    selectedMonth,
    selectedMonths,
    fromMonth,
    toMonth,
    monthFilterMode,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleResetFilters = () => {
    setSelectedClient('');
    setSelectedSupplier('');
    setSelectedChannel('');
    setSelectedContent('');
    setSelectedMonth('');
    setSelectedMonths([]);
    setFromMonth('');
    setToMonth('');
    setSearchTerm('');
  };

  const activeFiltersCount = [
    selectedClient,
    selectedSupplier,
    selectedChannel,
    selectedContent,
    monthFilterMode === 'single' && selectedMonth ? selectedMonth : null,
    monthFilterMode === 'multi' && selectedMonths.length > 0 ? `${selectedMonths.length} شهور` : null,
    monthFilterMode === 'range' && (fromMonth || toMonth) ? 'range' : null,
  ].filter(Boolean).length;

  // Export Data as CSV (Client | supplier | Channel | Content | Content Type | Month | Net to Channel | Net to Client | Notes)
  const handleExport = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedClient) params.append('clientId', selectedClient);
    if (selectedSupplier) params.append('supplierId', selectedSupplier);
    if (selectedChannel) params.append('channelId', selectedChannel);
    if (selectedContent) params.append('contentId', selectedContent);

    if (monthFilterMode === 'single' && selectedMonth) {
      params.append('month', selectedMonth);
    } else if (monthFilterMode === 'multi' && selectedMonths.length > 0) {
      params.append('months', selectedMonths.join(','));
    } else if (monthFilterMode === 'range') {
      if (fromMonth) params.append('fromMonth', fromMonth);
      if (toMonth) params.append('toMonth', toMonth);
    }

    window.open(`/api/records/export?${params.toString()}`, '_blank');
  };

  // Download Empty Template
  const handleDownloadTemplate = () => {
    window.open('/api/records/template', '_blank');
  };

  // Parse CSV File on file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVText(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Robust CSV Parser supporting commas within quotes and Arabic
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setMessage({ text: 'الملف لا يحتوي على صفوف بيانات كافية', type: 'error' });
      return;
    }

    const splitLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = splitLine(lines[0]);
    const parsedRows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      if (values.length >= 4) {
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        parsedRows.push(rowObj);
      }
    }

    setImportPreview(parsedRows);
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);

    const res = await apiRequest('/records/import', {
      method: 'POST',
      body: JSON.stringify({ rows: importPreview }),
    });

    setImporting(false);
    if (res.success) {
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setMessage({
        text: res.message || `تم استيراد ${res.data?.importedCount} سجل بنجاح!`,
        type: 'success',
      });
      fetchRecords();
      fetchFacets();
    } else {
      setMessage({ text: res.message || 'فشل استيراد البيانات', type: 'error' });
    }
  };

  // Add single campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    const res = await apiRequest('/records', {
      method: 'POST',
      body: JSON.stringify({
        ...newCampaign,
        netToChannel: Number(newCampaign.netToChannel),
        netToClient: Number(newCampaign.netToClient),
        cost: Number(newCampaign.netToClient || newCampaign.netToChannel),
      }),
    });

    setActionLoading(false);
    if (res.success) {
      setShowAddModal(false);
      setMessage({ text: 'تمت إضافة حملة الميديا بنجاح', type: 'success' });
      setNewCampaign({
        title: '',
        clientId: '',
        supplierId: '',
        channelId: '',
        contentId: '',
        month: 'يناير 2026',
        netToChannel: 0,
        netToClient: 0,
        notes: '',
        status: 'PLANNED',
      });
      fetchRecords();
      fetchFacets();
    } else {
      setMessage({ text: res.message || 'فشل حفظ الحملة', type: 'error' });
    }
  };

  // One-click issue invoice in accounting department
  const handleIssueInvoice = async (recordId: string) => {
    setActionLoading(true);
    setMessage(null);
    const res = await apiRequest('/accounting/create-invoice-from-media', {
      method: 'POST',
      body: JSON.stringify({ mediaRecordId: recordId }),
    });
    setActionLoading(false);

    if (res.success && res.data) {
      setMessage({
        text: `تم إصدار الفاتورة المحاسبية رقم (${res.data.invoiceNumber}) بمبلغ ${res.data.totalAmount} ج.م وربطها بنظام المحاسبة!`,
        type: 'success',
      });
      fetchRecords();
    } else {
      setMessage({ text: res.message || 'فشل إصدار الفاتورة', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons (Add, Import, Export) */}
      <div className="bg-gradient-to-r from-[#171717] via-[#222222] to-[#171717] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-neutral-800">
        <div className="absolute top-0 end-0 -mt-8 -me-8 w-48 h-48 bg-[#DC2626]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="text-xs font-bold text-red-400">لوحة تحكم قسم الميديا وتخطيط الحملات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              سجلات الميديا والبيانات المالية
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              إدخال واستخراج البيانات (Import & Export)، تصفية ذكية على نظام Kaggle، وربط المحاسبة
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Import Button (Hidden for View-Only / Manager) */}
            {!isReadOnly && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold border border-neutral-700 shadow-md transition-all"
                title="استيراد بيانات من ملف CSV أو Excel"
              >
                <Upload className="w-4 h-4 text-[#20BEFF]" />
                <span>استيراد بيانات (Import)</span>
              </button>
            )}

            {/* Export Button (Available for everyone) */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold border border-neutral-700 shadow-md transition-all"
              title="تصدير البيانات الحالية كملف CSV مرتب"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تصدير بيانات (Export)</span>
            </button>

            {/* Add New Campaign (Hidden for View-Only / Manager) */}
            {!isReadOnly ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black shadow-lg shadow-red-900/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حملة جديدة</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>وضع المراقبة: استعراض وتصدير التقارير فقط</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Only Alert for Manager */}
      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-200/80 text-amber-950 p-4 rounded-3xl flex items-center gap-3 text-xs font-bold shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0 font-black">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-sm block">مرحباً بك {user?.name || 'يا مدير'} (حساب متابعة وعرض فقط)</span>
            <span className="text-amber-800 text-[11px] font-medium">
              أنت الآن في وضع المشاهدة لقسم الميديا: يمكنك تصفح كافة الحملات والبيانات والفلترة المتقدمة للشهور وتصدير التقارير دون إمكانية إجراء أي تعديل أو حذف.
            </span>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-neutral-500">إجمالي سجلات الحملات</span>
          <div className="text-2xl font-black text-neutral-900">{records.length}</div>
          <div className="text-[11px] text-neutral-400">سجل إعلاني موثق</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-neutral-500">إجمالي Net to Client (ج.م)</span>
          <div className="text-2xl font-black text-[#DC2626]">
            {totalNetToClient.toLocaleString()} ج.م
          </div>
          <div className="text-[11px] text-neutral-400">القيمة الصافية المستحقة على العملاء</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-neutral-500">إجمالي Net to Channel (ج.م)</span>
          <div className="text-2xl font-black text-blue-600">
            {totalNetToChannel.toLocaleString()} ج.م
          </div>
          <div className="text-[11px] text-neutral-400">التكلفة الصافية للقنوات والموردين</div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* KAGGLE-STYLE SEARCH & FILTER BAR                               */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute top-3.5 start-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو العميل أو المورد أو القناة أو المحتوى أو الشهر أو الملاحظات..."
              className="w-full ps-10 pe-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#DC2626] transition-colors"
            />
          </form>

          {/* Kaggle Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-extrabold transition-all shrink-0 ${
              filterDrawerOpen || activeFiltersCount > 0
                ? 'bg-[#171717] text-white border-neutral-900 shadow-md'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#DC2626]" />
            <span>الفلاتر المتقدمة (Filters)</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[10px] flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Kaggle Filter Panel */}
        {filterDrawerOpen && facets && (
          <div className="pt-4 border-t border-neutral-100 space-y-3 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/60 text-xs">
            {/* Row 1: The 4 Primary Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Client Filter */}
              <div>
                <label className="block font-black text-neutral-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span>العميل (Client)</span>
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-[#DC2626]"
                >
                  <option value="">جميع العملاء</option>
                  {facets.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Supplier Filter */}
              <div>
                <label className="block font-black text-neutral-700 mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>المورد (supplier)</span>
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-[#DC2626]"
                >
                  <option value="">جميع الموردين</option>
                  {facets.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Channel Filter */}
              <div>
                <label className="block font-black text-neutral-700 mb-1 flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5 text-neutral-500" />
                  <span>القناة (Channel)</span>
                </label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-[#DC2626]"
                >
                  <option value="">جميع القنوات</option>
                  {facets.channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Content Filter */}
              <div>
                <label className="block font-black text-neutral-700 mb-1 flex items-center gap-1">
                  <FileVideo className="w-3.5 h-3.5 text-neutral-500" />
                  <span>المحتوى (Content)</span>
                </label>
                <select
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-[#DC2626]"
                >
                  <option value="">جميع المحتويات</option>
                  {facets.contents.map((cnt) => (
                    <option key={cnt.id} value={cnt.id}>
                      {cnt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Advanced Month Filter (Single / Multi / Range) */}
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-sm space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center font-black">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-neutral-800 text-xs">فلترة الشهور (Month Filtering)</span>
                    <p className="text-[10px] text-neutral-400 font-semibold">
                      اختر شهر محدد، أو عدة شهور معاً، أو حدد نطاقاً زمنياً (من شهر إلى شهر)
                    </p>
                  </div>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="inline-flex p-1 bg-neutral-100 rounded-xl gap-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setMonthFilterMode('single');
                      setSelectedMonths([]);
                      setFromMonth('');
                      setToMonth('');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      monthFilterMode === 'single'
                        ? 'bg-white text-neutral-900 shadow-sm font-black'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    شهر واحد
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthFilterMode('multi');
                      setSelectedMonth('');
                      setFromMonth('');
                      setToMonth('');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      monthFilterMode === 'multi'
                        ? 'bg-white text-neutral-900 shadow-sm font-black'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    عدة أشهر {selectedMonths.length > 0 && `(${selectedMonths.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthFilterMode('range');
                      setSelectedMonth('');
                      setSelectedMonths([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      monthFilterMode === 'range'
                        ? 'bg-white text-neutral-900 shadow-sm font-black'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    من شهر إلى شهر (نطاق)
                  </button>
                </div>
              </div>

              {/* Mode 1: Single Month */}
              {monthFilterMode === 'single' && (
                <div className="max-w-xs pt-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:border-[#DC2626]"
                  >
                    <option value="">جميع الشهور</option>
                    {facets.months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mode 2: Multi-select Months */}
              {monthFilterMode === 'multi' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500 font-bold">انقر على الشهور التي تريد تصفية البيانات بها:</span>
                    {selectedMonths.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMonths([])}
                        className="text-[#DC2626] hover:underline font-bold"
                      >
                        إلغاء تحديد الكل ({selectedMonths.length})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-neutral-50/50 rounded-xl border border-neutral-100">
                    {facets.months.map((m) => {
                      const isSelected = selectedMonths.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMonths(selectedMonths.filter((x) => x !== m));
                            } else {
                              setSelectedMonths([...selectedMonths, m]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-[#171717] text-white border-neutral-900 shadow-sm'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 3: Range (From Month to To Month) */}
              {monthFilterMode === 'range' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">من شهر (بداية الفترة):</label>
                    <select
                      value={fromMonth}
                      onChange={(e) => setFromMonth(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:border-[#DC2626]"
                    >
                      <option value="">-- من البداية --</option>
                      {facets.months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">إلى شهر (نهاية الفترة):</label>
                    <select
                      value={toMonth}
                      onChange={(e) => setToMonth(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:border-[#DC2626]"
                    >
                      <option value="">-- حتى النهاية --</option>
                      {facets.months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filter Chips / Pills (Kaggle Style) */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-400">الفلاتر المطبقة:</span>

            {selectedClient && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800">
                <span>العميل: {facets?.clients.find((c) => c.id === selectedClient)?.name}</span>
                <button onClick={() => setSelectedClient('')} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedSupplier && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800">
                <span>المورد: {facets?.suppliers.find((s) => s.id === selectedSupplier)?.name}</span>
                <button onClick={() => setSelectedSupplier('')} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedChannel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800">
                <span>القناة: {facets?.channels.find((ch) => ch.id === selectedChannel)?.name}</span>
                <button onClick={() => setSelectedChannel('')} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedContent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800">
                <span>المحتوى: {facets?.contents.find((cnt) => cnt.id === selectedContent)?.name}</span>
                <button onClick={() => setSelectedContent('')} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {monthFilterMode === 'single' && selectedMonth && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800">
                <span>الشهر: {selectedMonth}</span>
                <button onClick={() => setSelectedMonth('')} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {monthFilterMode === 'multi' && selectedMonths.length > 0 && (
              <>
                {selectedMonths.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800"
                  >
                    <span>شهر: {m}</span>
                    <button
                      onClick={() => setSelectedMonths(selectedMonths.filter((x) => x !== m))}
                      className="hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </>
            )}

            {monthFilterMode === 'range' && (fromMonth || toMonth) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800">
                <span>
                  الفترة: من {fromMonth || 'البداية'} إلى {toMonth || 'النهاية'}
                </span>
                <button
                  onClick={() => {
                    setFromMonth('');
                    setToMonth('');
                  }}
                  className="hover:text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[#DC2626] hover:underline ms-2"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MAIN DATA TABLE: ORDERED EXACTLY AS REQUESTED & IN THE IMAGE   */}
      {/* Client | supplier | Channel | Content | Content Type | Month | Net to Channel | Net to Client | Notes */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs text-neutral-900">جدول حملات الميديا وتفاصيل التكاليف</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 font-bold text-neutral-600">
              {records.length} صف
            </span>
          </div>
          <button
            onClick={handleExport}
            className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير هذا الجدول</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#171717] text-white font-black">
              <tr>
                <th className="p-3.5 text-start">Client</th>
                <th className="p-3.5 text-start">supplier</th>
                <th className="p-3.5 text-start">Channel</th>
                <th className="p-3.5 text-start">Content</th>
                <th className="p-3.5 text-start">Content Type</th>
                <th className="p-3.5 text-start">Month</th>
                <th className="p-3.5 text-start">Net to Channel</th>
                <th className="p-3.5 text-start">Net to Client</th>
                <th className="p-3.5 text-start">Notes</th>
                <th className="p-3.5 text-end">إجراء المحاسبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-neutral-400 font-bold">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-neutral-400 font-bold">
                    لا توجد بيانات مطابقة. يمكنك استخدام زر (Import) لاستيراد ملف البيانات أو إضافة حملة يدوياً.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* 1. Client */}
                    <td className="p-3.5 font-black text-neutral-900 text-sm whitespace-nowrap">
                      {r.client?.name}
                    </td>

                    {/* 2. supplier */}
                    <td className="p-3.5 font-bold text-neutral-700 whitespace-nowrap">
                      {r.supplier?.name}
                    </td>

                    {/* 3. Channel */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#DC2626] font-extrabold border border-red-100">
                        {r.channel?.name}
                      </span>
                    </td>

                    {/* 4. Content */}
                    <td className="p-3.5 font-bold text-neutral-800">{r.content?.name}</td>

                    {/* 5. Content Type */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-100 text-[11px]">
                        {r.content?.contentType?.name || 'عام'}
                      </span>
                    </td>

                    {/* 6. Month */}
                    <td className="p-3.5 font-bold text-neutral-700 whitespace-nowrap">{r.month}</td>

                    {/* 7. Net to Channel */}
                    <td className="p-3.5 font-black text-blue-700 whitespace-nowrap">
                      {Number(r.netToChannel || 0).toLocaleString()} ج.م
                    </td>

                    {/* 8. Net to Client */}
                    <td className="p-3.5 font-black text-[#DC2626] whitespace-nowrap">
                      {Number(r.netToClient || r.cost || 0).toLocaleString()} ج.م
                    </td>

                    {/* 9. Notes */}
                    <td className="p-3.5 text-neutral-500 max-w-xs truncate">{r.notes || '-'}</td>

                    {/* 10. Accounting Action */}
                    <td className="p-3.5 text-end whitespace-nowrap">
                      {r.invoiceId ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مفوترة</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleIssueInvoice(r.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-[10px] transition-all inline-flex items-center gap-1 shadow-sm"
                          title="إصدار فاتورة رسمية في قسم المحاسبة"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>إصدار فاتورة</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* IMPORT MODAL                                                   */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-black text-neutral-900 text-base">استيراد بيانات الميديا (Import CSV)</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  قم بتحميل ملف CSV يحتوي على الأعمدة المعتمدة بالترتيب الدقيق
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Box */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-neutral-800">تحميل القالب النموذجي المعتمد</div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Client, supplier, Channel, Content, Content Type, Month, Net to Channel, Net to Client, Notes
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <FileDown className="w-4 h-4 text-[#20BEFF]" />
                <span>تحميل القالب الفارغ</span>
              </button>
            </div>

            {/* File Upload Drop Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-[#DC2626] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-red-50/20 space-y-2"
              >
                <Upload className="w-8 h-8 text-neutral-400 mx-auto" />
                <div className="text-xs font-bold text-neutral-700">
                  {importFile ? importFile.name : 'اضغط هنا لاختيار ملف CSV من جهازك'}
                </div>
                <div className="text-[10px] text-neutral-400">
                  يدعم ترميز UTF-8 واللغة العربية والأرقام المالية
                </div>
              </div>
            </div>

            {/* Preview of Parsed Rows */}
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">
                    معاينة البيانات قبل الحفظ ({importPreview.length} صف تم التعرف عليه):
                  </span>
                  <span className="text-emerald-600 font-bold">جاهز للاستيراد</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-xl overflow-x-auto text-[11px]">
                  <table className="w-full text-start">
                    <thead className="bg-neutral-100 font-bold sticky top-0">
                      <tr>
                        <th className="p-2 text-start">Client</th>
                        <th className="p-2 text-start">supplier</th>
                        <th className="p-2 text-start">Channel</th>
                        <th className="p-2 text-start">Content</th>
                        <th className="p-2 text-start">Content Type</th>
                        <th className="p-2 text-start">Month</th>
                        <th className="p-2 text-start">Net to Channel</th>
                        <th className="p-2 text-start">Net to Client</th>
                        <th className="p-2 text-start">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {importPreview.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="p-2 font-bold">{row['Client'] || row['client']}</td>
                          <td className="p-2">{row['supplier'] || row['Supplier']}</td>
                          <td className="p-2">{row['Channel'] || row['channel']}</td>
                          <td className="p-2">{row['Content'] || row['content']}</td>
                          <td className="p-2">{row['Content Type'] || row['content_type']}</td>
                          <td className="p-2">{row['Month'] || row['month']}</td>
                          <td className="p-2 font-bold text-blue-600">
                            {row['Net to Channel'] || row['netToChannel']}
                          </td>
                          <td className="p-2 font-bold text-[#DC2626]">
                            {row['Net to Client'] || row['netToClient']}
                          </td>
                          <td className="p-2 text-neutral-400">{row['Notes'] || row['notes']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importPreview.length > 10 && (
                  <div className="text-[10px] text-neutral-400 text-center">
                    ... وعرض {importPreview.length - 10} صفوف أخرى
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing || importPreview.length === 0}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {importing ? 'جاري الاستيراد والحفظ في قاعدة البيانات...' : 'تأكيد وحفظ البيانات في النظام'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD CAMPAIGN MODAL                                             */}
      {/* ============================================================== */}
      {showAddModal && facets && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="font-black text-neutral-900 text-base">تسجيل حملة ميديا جديدة</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">العميل (Client) *</label>
                  <select
                    required
                    value={newCampaign.clientId}
                    onChange={(e) => setNewCampaign({ ...newCampaign, clientId: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="">-- اختر العميل --</option>
                    {facets.clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">المورد (supplier) *</label>
                  <select
                    required
                    value={newCampaign.supplierId}
                    onChange={(e) => setNewCampaign({ ...newCampaign, supplierId: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="">-- اختر المورد --</option>
                    {facets.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">القناة (Channel) *</label>
                  <select
                    required
                    value={newCampaign.channelId}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channelId: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="">-- اختر القناة --</option>
                    {facets.channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">المحتوى (Content) *</label>
                  <select
                    required
                    value={newCampaign.contentId}
                    onChange={(e) => setNewCampaign({ ...newCampaign, contentId: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="">-- اختر المحتوى --</option>
                    {facets.contents.map((cnt) => (
                      <option key={cnt.id} value={cnt.id}>
                        {cnt.name} ({cnt.contentType?.name || 'نوع مخصص'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">الشهر (Month) *</label>
                  <input
                    type="text"
                    required
                    placeholder="يناير 2026"
                    value={newCampaign.month}
                    onChange={(e) => setNewCampaign({ ...newCampaign, month: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Net to Channel *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newCampaign.netToChannel}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, netToChannel: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-black text-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Net to Client *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newCampaign.netToClient}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, netToClient: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-black text-[#DC2626]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Notes (ملاحظات)</label>
                <textarea
                  rows={2}
                  value={newCampaign.notes}
                  onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
                  placeholder="ملاحظات حول الحملة أو الاستهداف أو الاتفاق..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl"
                >
                  حفظ الحملة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
