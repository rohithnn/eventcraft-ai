import jsPDF from 'jspdf';
import { FullEventPlan } from '../types/event';
import { formatCurrency } from '../utils/budgetUtils';
import { formatFriendlyDate } from '../utils/dateUtils';

/**
 * Generates and downloads a clean, professional PDF dossier of the full event plan
 */
export function exportPlanToPdf(plan: FullEventPlan): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 50;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header banner
  doc.setFillColor(244, 63, 94); // Rose 500
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(plan.details.title, margin, y);
  y += 20;

  // Subtitle / Brand
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`EventCraft AI Dossier • Generated on ${new Date().toLocaleDateString()}`, margin, y);
  y += 24;

  // Overview box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 85, 4, 4, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 14;
  const col2X = margin + 260;

  doc.text(`Type: ${plan.details.eventType.toUpperCase()}`, col1X, y + 20);
  doc.text(`Date: ${formatFriendlyDate(plan.details.date)}`, col1X, y + 36);
  doc.text(`Guests: ${plan.details.guestCount} attendees`, col1X, y + 52);
  doc.text(`Location: ${plan.details.city}`, col1X, y + 68);

  doc.text(`Total Budget: ${formatCurrency(plan.details.totalBudget, plan.details.currency)}`, col2X, y + 20);
  doc.text(`Theme / Vibe: ${plan.details.themeVibe.slice(0, 35)}...`, col2X, y + 36);
  doc.text(`Dietary: ${plan.details.dietaryNeeds ? plan.details.dietaryNeeds.slice(0, 35) : 'Standard / None'}`, col2X, y + 52);
  doc.text(`Accessibility: ${plan.details.accessibilityNeeds ? plan.details.accessibilityNeeds.slice(0, 35) : 'Standard / None'}`, col2X, y + 68);

  y += 105;

  // 1. Budget Breakdown Table
  checkPageBreak(120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Budget Allocation', margin, y);
  y += 18;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Category', margin + 8, y + 14);
  doc.text('Allocated', margin + 170, y + 14);
  doc.text('Spent', margin + 270, y + 14);
  doc.text('Share', margin + 370, y + 14);
  doc.text('Status', margin + 440, y + 14);
  y += 22;

  doc.setFont('helvetica', 'normal');
  plan.budget.forEach((item) => {
    checkPageBreak(20);
    const isOver = item.spentAmount > item.allocatedAmount;
    doc.setTextColor(30, 41, 59);
    doc.text(item.categoryLabel, margin + 8, y + 12);
    doc.text(formatCurrency(item.allocatedAmount, plan.details.currency), margin + 170, y + 12);
    doc.text(formatCurrency(item.spentAmount, plan.details.currency), margin + 270, y + 12);
    doc.text(`${item.percentageOfBudget}%`, margin + 370, y + 12);
    doc.setTextColor(isOver ? 220 : 22, isOver ? 38 : 101, isOver ? 38 : 52);
    doc.text(isOver ? 'Over budget' : 'On track', margin + 440, y + 12);
    y += 18;
  });

  y += 15;

  // 2. Timeline Tasks
  checkPageBreak(140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Backward-Planned Timeline', margin, y);
  y += 18;

  // Timeline table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Timeframe / Due', margin + 8, y + 14);
  doc.text('Task Description', margin + 140, y + 14);
  doc.text('Status', margin + 440, y + 14);
  y += 22;

  doc.setFont('helvetica', 'normal');
  plan.timeline.forEach((task) => {
    checkPageBreak(24);
    doc.setTextColor(71, 85, 105);
    doc.text(`${task.timeframe} (${task.dueDate})`, margin + 8, y + 12);
    doc.setTextColor(15, 23, 42);
    doc.text(task.title.length > 55 ? task.title.slice(0, 52) + '...' : task.title, margin + 140, y + 12);
    const statusText = task.status === 'completed' ? '✓ Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending';
    doc.setTextColor(task.status === 'completed' ? 16 : 100, task.status === 'completed' ? 185 : 116, task.status === 'completed' ? 129 : 139);
    doc.text(statusText, margin + 440, y + 12);
    y += 18;
  });

  y += 15;

  // 3. Vendors
  if (plan.vendors.length > 0) {
    checkPageBreak(120);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Vendor Contacts & Quotes', margin, y);
    y += 18;

    plan.vendors.forEach((vendor) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${vendor.name} (${vendor.categoryLabel}) - ${vendor.status}`, margin + 8, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const contactInfo = [vendor.contactName, vendor.phone, vendor.email].filter(Boolean).join(' | ');
      doc.text(`Quoted: ${formatCurrency(vendor.quotedPrice, plan.details.currency)} • ${contactInfo || 'No direct contact'}`, margin + 8, y + 22);
      y += 28;
    });
  }

  // 4. Saved Ideas
  checkPageBreak(100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Curated Theme & Experience Ideas', margin, y);
  y += 18;

  const allPinned = [
    ...plan.ideas.themes,
    ...plan.ideas.decor,
    ...plan.ideas.menu,
    ...plan.ideas.activities,
    ...plan.ideas.returnGifts,
  ].filter((i) => i.isPinned);

  const ideasToPrint = allPinned.length > 0 ? allPinned : plan.ideas.themes.slice(0, 3);
  ideasToPrint.forEach((idea) => {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`• ${idea.title}`, margin + 8, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(idea.description.slice(0, 95) + (idea.description.length > 95 ? '...' : ''), margin + 18, y + 22);
    y += 28;
  });

  const sanitizedTitle = plan.details.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  doc.save(`eventcraft-plan-${sanitizedTitle}.pdf`);
}

/**
 * Exports plan as downloadable formatted JSON
 */
export function exportPlanToJson(plan: FullEventPlan): void {
  const jsonStr = JSON.stringify(plan, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedTitle = plan.details.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  link.download = `eventcraft-${sanitizedTitle}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
