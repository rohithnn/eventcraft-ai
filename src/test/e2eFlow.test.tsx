import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import * as pdfExport from '../services/pdfExport';

describe('End-to-End Integration Flow', () => {
  it('executes full workflow: switches sample event, edits budget line, checks over-budget warning, and triggers export', async () => {
    const exportPdfSpy = vi.spyOn(pdfExport, 'exportPlanToPdf').mockImplementation(() => {});

    render(<App />);

    // 1. App loads initially with sample wedding
    expect(screen.getAllByText(/Priya & Aarav’s Royal Jaipur Palace Wedding/i)[0]).toBeInTheDocument();

    // 2. Navigate to Budget tab
    const budgetTab = screen.getByRole('button', { name: /AI Budget Planner/i });
    fireEvent.click(budgetTab);

    // Verify budget table and categories exist
    expect(screen.getAllByText(/Palace \/ Resort & Lawns/i)[0]).toBeInTheDocument();

    // 3. Edit a budget line: click edit on Venue
    const editVenueButton = screen.getByRole('button', { name: /Edit Palace \/ Resort & Lawns/i });
    fireEvent.click(editVenueButton);

    // Enter a higher spent amount to trigger over-budget state
    const spentInput = screen.getByLabelText(/Edit spent amount for Palace \/ Resort & Lawns/i);
    fireEvent.change(spentInput, { target: { value: '2500000' } });

    // Save edit
    const saveButton = screen.getByRole('button', { name: /Save changes/i });
    fireEvent.click(saveButton);

    // 4. Over budget badge should now be visible
    expect(screen.getAllByText(/Over by/i).length).toBeGreaterThanOrEqual(1);

    // 5. Trigger Export modal
    const exportButton = screen.getByTitle(/Export Dossier \(PDF\/JSON\/Print\)/i);
    fireEvent.click(exportButton);

    // Verify modal headline
    expect(screen.getByText(/Export & Share Event Plan/i)).toBeInTheDocument();

    // 6. Click "Download PDF Dossier"
    const downloadPdfButton = screen.getByRole('button', { name: /Download PDF Dossier/i });
    fireEvent.click(downloadPdfButton);

    expect(exportPdfSpy).toHaveBeenCalled();
  });
});
