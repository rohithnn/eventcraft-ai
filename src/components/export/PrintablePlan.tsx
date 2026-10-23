import React from 'react';
import { FullEventPlan } from '../../types/event';
import { formatCurrency } from '../../utils/budgetUtils';
import { formatFriendlyDate } from '../../utils/dateUtils';

interface PrintablePlanProps {
  plan: FullEventPlan;
}

export function PrintablePlan({ plan }: PrintablePlanProps) {
  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-rose-500 pb-4 mb-6">
        <h1 className="text-2xl font-black">{plan.details.title}</h1>
        <p className="text-xs text-gray-600 mt-1">
          EventCraft AI Master Plan • Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded mb-6 text-sm">
        <div>
          <p><strong>Event Type:</strong> {plan.details.eventType.toUpperCase()}</p>
          <p><strong>Target Date:</strong> {formatFriendlyDate(plan.details.date)}</p>
          <p><strong>Estimated Guests:</strong> {plan.details.guestCount}</p>
          <p><strong>City / Location:</strong> {plan.details.city}</p>
        </div>
        <div>
          <p><strong>Total Budget:</strong> {formatCurrency(plan.details.totalBudget, plan.details.currency)}</p>
          <p><strong>Theme / Vibe:</strong> {plan.details.themeVibe}</p>
          <p><strong>Dietary Accommodations:</strong> {plan.details.dietaryNeeds || 'Standard'}</p>
          <p><strong>Accessibility:</strong> {plan.details.accessibilityNeeds || 'Standard'}</p>
        </div>
      </div>

      {/* 1. Budget Breakdown */}
      <div className="mb-8">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">1. Budget Allocations</h2>
        <table className="w-full text-left text-xs border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2">Category</th>
              <th className="p-2 text-right">Allocated</th>
              <th className="p-2 text-right">Actual Spent</th>
              <th className="p-2 text-center">Share</th>
              <th className="p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {plan.budget.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2 font-medium">{item.categoryLabel}</td>
                <td className="p-2 text-right">{formatCurrency(item.allocatedAmount, plan.details.currency)}</td>
                <td className="p-2 text-right">{formatCurrency(item.spentAmount, plan.details.currency)}</td>
                <td className="p-2 text-center">{item.percentageOfBudget}%</td>
                <td className="p-2 text-gray-600">{item.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Backward-Planned Timeline */}
      <div className="mb-8 print-page-break">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">2. Backward-Planned Timeline</h2>
        <table className="w-full text-left text-xs border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2">Timeframe</th>
              <th className="p-2">Target Date</th>
              <th className="p-2">Milestone Task</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {plan.timeline.map((task) => (
              <tr key={task.id} className="border-b border-gray-200">
                <td className="p-2 font-medium">{task.timeframe}</td>
                <td className="p-2">{formatFriendlyDate(task.dueDate)}</td>
                <td className="p-2">
                  <div className="font-semibold">{task.title}</div>
                  {task.description && <div className="text-gray-500 text-[10px]">{task.description}</div>}
                </td>
                <td className="p-2 capitalize">{task.priority}</td>
                <td className="p-2 font-medium">{task.status === 'completed' ? '[X] Done' : '[ ] Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Vendors */}
      {plan.vendors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">3. Contracted & Shortlisted Vendors</h2>
          <table className="w-full text-left text-xs border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2">Vendor Name</th>
                <th className="p-2">Category</th>
                <th className="p-2 text-right">Quoted Price</th>
                <th className="p-2">Status</th>
                <th className="p-2">Contact & Notes</th>
              </tr>
            </thead>
            <tbody>
              {plan.vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-200">
                  <td className="p-2 font-semibold">{vendor.name}</td>
                  <td className="p-2">{vendor.categoryLabel}</td>
                  <td className="p-2 text-right">{formatCurrency(vendor.quotedPrice, plan.details.currency)}</td>
                  <td className="p-2 font-medium">{vendor.status}</td>
                  <td className="p-2 text-gray-600">
                    {[vendor.contactName, vendor.phone, vendor.email].filter(Boolean).join(' • ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Curated Ideas */}
      <div className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">4. Curated Theme & Aesthetic Concepts</h2>
        <div className="space-y-3">
          {plan.ideas.themes.slice(0, 3).map((th) => (
            <div key={th.id} className="border-l-2 border-rose-500 pl-3">
              <h3 className="font-bold text-xs">{th.title}</h3>
              <p className="text-xs text-gray-600">{th.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
