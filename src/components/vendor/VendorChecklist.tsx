import React, { useState } from 'react';
import { Vendor, VendorStatus, BudgetCategory, CurrencyCode } from '../../types/event';
import { BUDGET_CATEGORIES, DEFAULT_VENDOR_QUESTIONS } from '../../constants/defaults';
import { formatCurrency } from '../../utils/budgetUtils';
import { VendorQuestionsModal } from './VendorQuestionsModal';
import { Modal } from '../common/Modal';
import { Plus, HelpCircle, Phone, Mail, Globe, CheckCircle, Clock, Trash2, Edit2, Sparkles, Building2 } from 'lucide-react';

interface VendorChecklistProps {
  vendors: Vendor[];
  currency: CurrencyCode;
  eventType: string;
  guestCount: number;
  city: string;
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onUpdateVendor: (id: string, updates: Partial<Vendor>) => void;
  onDeleteVendor: (id: string) => void;
  onFetchQuestions: (category: BudgetCategory) => Promise<string[]>;
}

export function VendorChecklist({
  vendors,
  currency,
  eventType,
  guestCount,
  city,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onFetchQuestions,
}: VendorChecklistProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Question modal state
  const [activeVendorForQuestions, setActiveVendorForQuestions] = useState<Vendor | null>(null);
  const [modalQuestions, setModalQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // New vendor form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('venue');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number>(1000);
  const [status, setStatus] = useState<VendorStatus>('Shortlisted');
  const [notes, setNotes] = useState('');

  const statusStyles: Record<VendorStatus, string> = {
    Shortlisted: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    Booked: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    Paid: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  };

  const handleOpenQuestions = async (vendor: Vendor) => {
    setActiveVendorForQuestions(vendor);
    if (vendor.aiSuggestedQuestions && vendor.aiSuggestedQuestions.length > 0) {
      setModalQuestions(vendor.aiSuggestedQuestions);
    } else {
      setIsLoadingQuestions(true);
      const fetched = await onFetchQuestions(vendor.category);
      const questions = fetched.length > 0 ? fetched : DEFAULT_VENDOR_QUESTIONS[vendor.category] || [];
      setModalQuestions(questions);
      onUpdateVendor(vendor.id, { aiSuggestedQuestions: questions });
      setIsLoadingQuestions(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catMeta = BUDGET_CATEGORIES.find((c) => c.key === category);
    onAddVendor({
      name: name.trim(),
      category,
      categoryLabel: catMeta?.label || category,
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      quotedPrice: Number(quotedPrice) || 0,
      status,
      notes: notes.trim(),
      aiSuggestedQuestions: DEFAULT_VENDOR_QUESTIONS[category] || [],
    });

    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setQuotedPrice(1000);
    setNotes('');
    setIsAddModalOpen(false);
  };

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  const totalCommitted = vendors
    .filter((v) => v.status === 'Booked' || v.status === 'Paid')
    .reduce((acc, v) => acc + (v.quotedPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Vendor Directory & Checklist
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalCommitted, currency)} Committed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare quotes, track contracts, and get AI questions before signing
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All ({vendors.length})
        </button>
        <button
          onClick={() => setFilterStatus('Shortlisted')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'Shortlisted'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Shortlisted
        </button>
        <button
          onClick={() => setFilterStatus('Booked')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'Booked'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Booked
        </button>
        <button
          onClick={() => setFilterStatus('Paid')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'Paid'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Paid
        </button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => {
          const meta = BUDGET_CATEGORIES.find((c) => c.key === vendor.category);

          return (
            <div
              key={vendor.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {vendor.categoryLabel}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {vendor.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status selector */}
                    <select
                      value={vendor.status}
                      onChange={(e) => onUpdateVendor(vendor.id, { status: e.target.value as VendorStatus })}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${statusStyles[vendor.status]}`}
                      aria-label={`Status for ${vendor.name}`}
                    >
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Booked">Booked</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Price and contact details */}
                <div className="mb-3">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(vendor.quotedPrice, currency)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">quoted price</span>
                </div>

                {/* Contacts */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {vendor.contactName && <p className="font-medium">Contact: {vendor.contactName}</p>}
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-rose-600 dark:text-rose-400">{vendor.website}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mb-4">
                    {vendor.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenQuestions(vendor)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Vendor (AI Questions)
                </button>

                <button
                  onClick={() => onDeleteVendor(vendor.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  aria-label={`Remove vendor ${vendor.name}`}
                  title="Remove vendor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Vendor Entry"
        description="Track contracts, quotes, and points of contact."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Vendor / Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Blue Ridge Floral Design"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Shortlisted">Shortlisted</option>
                <option value="Booked">Booked</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Quoted Price ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="contact@vendor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Notes / Inclusions / Deliverables
            </label>
            <textarea
              rows={2}
              placeholder="Package details, deposit schedule, overtime policy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20"
            >
              Add Vendor
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Questions Modal */}
      {activeVendorForQuestions && (
        <VendorQuestionsModal
          isOpen={!!activeVendorForQuestions}
          onClose={() => setActiveVendorForQuestions(null)}
          vendorName={activeVendorForQuestions.name}
          categoryLabel={activeVendorForQuestions.categoryLabel}
          questions={modalQuestions}
          isLoading={isLoadingQuestions}
        />
      )}
    </div>
  );
}
