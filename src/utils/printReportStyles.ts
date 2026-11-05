/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Embedded standalone print styles to guarantee 100% styled report cards
 * even on production deployments (like Vercel) where external CSS link resolution
 * in print windows or html2canvas can fail or be blocked.
 */
export const getStandaloneReportCss = (paperCssSize: string = '215mm 330mm'): string => `
  @page {
    size: ${paperCssSize} portrait;
    margin: 0.5in !important;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    background-color: #f8fafc;
    color: #0f172a;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  ::selection {
    background-color: #059669;
    color: #ffffff !important;
  }

  /* Font Families */
  .font-cinzel {
    font-family: 'Cinzel', serif, Georgia, 'Times New Roman', serif;
  }

  .font-serif {
    font-family: Georgia, Cambria, "Times New Roman", Times, serif;
  }

  .font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  /* Document layout */
  .no-print-toolbar {
    position: sticky;
    top: 0;
    z-index: 9999;
    background: #ffffff;
    border-bottom: 2px solid #059669;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    margin-bottom: 24px;
  }

  .no-print-toolbar h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
  }

  .no-print-toolbar p {
    margin: 3px 0 0 0;
    font-size: 12px;
    color: #64748b;
  }

  .print-btn-action {
    background: #059669;
    color: #ffffff;
    border: none;
    padding: 10px 22px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }

  .print-btn-action:hover {
    background: #047857;
  }

  .print-container {
    max-width: 216mm;
    margin: 20px auto;
    padding: 0 10px;
  }

  /* Report Pages */
  [data-report-page="true"] {
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
    margin-bottom: 30px;
    padding: 2.5rem;
    page-break-after: always !important;
    break-after: page !important;
    overflow: hidden;
    position: relative;
  }

  /* Tables styling */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 6px 0 !important;
    font-size: 12px !important;
    color: #0f172a !important;
  }

  th, td {
    border: 1px solid #1e293b !important;
    padding: 6px 8px !important;
    vertical-align: top !important;
  }

  th {
    background-color: #f1f5f9 !important;
    color: #0f172a !important;
    font-weight: 700 !important;
    text-align: inherit;
  }

  tr:nth-child(even) td {
    background-color: #fcfcfc;
  }

  /* Flexbox & Grids */
  .flex { display: flex !important; }
  .flex-col { flex-direction: column !important; }
  .items-center { align-items: center !important; }
  .items-start { align-items: flex-start !important; }
  .items-end { align-items: flex-end !important; }
  .justify-between { justify-content: space-between !important; }
  .justify-center { justify-content: center !important; }
  .justify-end { justify-content: flex-end !important; }
  .flex-1 { flex: 1 1 0% !important; }
  .shrink-0 { flex-shrink: 0 !important; }

  .grid { display: grid !important; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .gap-1 { gap: 0.25rem !important; }
  .gap-2 { gap: 0.5rem !important; }
  .gap-3 { gap: 0.75rem !important; }
  .gap-4 { gap: 1rem !important; }
  .gap-6 { gap: 1.5rem !important; }
  .gap-x-6 { column-gap: 1.5rem !important; }
  .gap-x-8 { column-gap: 2rem !important; }
  .gap-y-1 { row-gap: 0.25rem !important; }
  .gap-y-1\\.5 { row-gap: 0.375rem !important; }
  .gap-y-2 { row-gap: 0.5rem !important; }

  /* Spacing */
  .space-y-1 > * + * { margin-top: 0.25rem !important; }
  .space-y-1\\.5 > * + * { margin-top: 0.375rem !important; }
  .space-y-2 > * + * { margin-top: 0.5rem !important; }
  .space-y-3 > * + * { margin-top: 0.75rem !important; }
  .space-y-4 > * + * { margin-top: 1rem !important; }
  .space-y-6 > * + * { margin-top: 1.5rem !important; }
  .space-y-10 > * + * { margin-top: 2.5rem !important; }
  .space-y-16 > * + * { margin-top: 4rem !important; }

  /* Width & Height */
  .w-3 { width: 0.75rem !important; }
  .w-4 { width: 1rem !important; }
  .w-8 { width: 2rem !important; }
  .w-14 { width: 3.5rem !important; }
  .w-16 { width: 4rem !important; }
  .w-20 { width: 5rem !important; }
  .w-24 { width: 6rem !important; }
  .w-28 { width: 7rem !important; }
  .w-44 { width: 11rem !important; }
  .w-52 { width: 13rem !important; }
  .w-56 { width: 14rem !important; }
  .w-64 { width: 16rem !important; }
  .w-full { width: 100% !important; }
  .max-w-md { max-width: 28rem !important; }
  .min-w-\\[140px\\] { min-width: 140px !important; }
  .min-w-\\[150px\\] { min-width: 150px !important; }
  .min-w-\\[160px\\] { min-width: 160px !important; }
  .h-24 { height: 6rem !important; }
  .h-36 { height: 9rem !important; }
  .min-h-\\[92px\\] { min-height: 92px !important; }

  /* Padding & Margins */
  .p-2 { padding: 0.5rem !important; }
  .p-3 { padding: 0.75rem !important; }
  .p-4 { padding: 1rem !important; }
  .p-6 { padding: 1.5rem !important; }
  .p-8 { padding: 2rem !important; }
  .p-12 { padding: 3rem !important; }
  .p-16 { padding: 4rem !important; }
  .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
  .px-5 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
  .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
  .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
  .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
  .pt-2 { padding-top: 0.5rem !important; }
  .pt-4 { padding-top: 1rem !important; }
  .pt-8 { padding-top: 2rem !important; }
  .pt-12 { padding-top: 3rem !important; }
  .pb-3 { padding-bottom: 0.75rem !important; }
  .my-10 { margin-top: 2.5rem !important; margin-bottom: 2.5rem !important; }
  .mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .mt-0\\.5 { margin-top: 0.125rem !important; }
  .mt-1 { margin-top: 0.25rem !important; }
  .mt-2 { margin-top: 0.5rem !important; }
  .mt-3 { margin-top: 0.75rem !important; }
  .mt-6 { margin-top: 1.5rem !important; }
  .mb-3 { margin-bottom: 0.75rem !important; }

  /* Typography */
  .text-center { text-align: center !important; }
  .text-left { text-align: left !important; }
  .text-right { text-align: right !important; }
  .uppercase { text-transform: uppercase !important; }
  .capitalize { text-transform: capitalize !important; }
  .italic { font-style: italic !important; }
  .underline { text-decoration: underline !important; }
  .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
  .tracking-wide { letter-spacing: 0.025em !important; }
  .tracking-wider { letter-spacing: 0.05em !important; }
  .tracking-widest { letter-spacing: 0.1em !important; }
  .leading-relaxed { line-height: 1.625 !important; }
  .leading-snug { line-height: 1.375 !important; }
  .break-words { overflow-wrap: break-word !important; word-break: break-word !important; }

  .text-\\[10px\\] { font-size: 10px !important; }
  .text-\\[11px\\] { font-size: 11px !important; }
  .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
  .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
  .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
  .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
  .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
  .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
  .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }

  .font-normal { font-weight: 400 !important; }
  .font-medium { font-weight: 500 !important; }
  .font-semibold { font-weight: 600 !important; }
  .font-bold { font-weight: 700 !important; }
  .font-extrabold { font-weight: 800 !important; }
  .font-black { font-weight: 900 !important; }

  /* Colors */
  .text-white { color: #ffffff !important; }
  .text-slate-900 { color: #0f172a !important; }
  .text-slate-800 { color: #1e293b !important; }
  .text-slate-700 { color: #334155 !important; }
  .text-slate-600 { color: #475569 !important; }
  .text-slate-500 { color: #64748b !important; }
  .text-slate-400 { color: #94a3b8 !important; }
  .text-emerald-800 { color: #065f46 !important; }
  .text-emerald-700 { color: #047857 !important; }
  .text-emerald-600 { color: #059669 !important; }

  .bg-white { background-color: #ffffff !important; }
  .bg-slate-50 { background-color: #f8fafc !important; }
  .bg-slate-100 { background-color: #f1f5f9 !important; }
  .bg-emerald-50 { background-color: #ecfdf5 !important; }
  .bg-gradient-to-br { background: linear-gradient(135deg, #059669 0%, #115e59 100%) !important; }

  /* Borders */
  .border { border: 1px solid #cbd5e1 !important; }
  .border-2 { border: 2px solid #1e293b !important; }
  .border-dashed { border-style: dashed !important; }
  .border-t { border-top: 1px solid #cbd5e1 !important; }
  .border-b { border-bottom: 1px solid #cbd5e1 !important; }
  .border-b-2 { border-bottom: 2px solid #1e293b !important; }
  .border-slate-300 { border-color: #cbd5e1 !important; }
  .border-slate-400 { border-color: #94a3b8 !important; }
  .border-slate-800 { border-color: #1e293b !important; }
  .border-slate-900 { border-color: #0f172a !important; }
  .rounded { border-radius: 0.25rem !important; }
  .rounded-lg { border-radius: 0.5rem !important; }
  .rounded-xl { border-radius: 0.75rem !important; }
  .rounded-2xl { border-radius: 1rem !important; }

  /* Print specific overrides */
  @media print {
    html, body {
      background-color: #ffffff !important;
      color: #000000 !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .no-print-toolbar {
      display: none !important;
    }

    .print-container {
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    [data-report-page="true"] {
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      page-break-after: always !important;
      break-after: page !important;
      min-height: auto !important;
    }

    th, td {
      border: 1px solid #000000 !important;
      color: #000000 !important;
    }

    .text-slate-900, .text-slate-800, .text-slate-700, .text-slate-600 {
      color: #000000 !important;
    }

    .border-slate-800, .border-slate-900 {
      border-color: #000000 !important;
    }
  }
`;
