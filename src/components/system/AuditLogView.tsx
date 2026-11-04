/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { History, Search, ShieldCheck, Clock, User } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Audit Log Aktivitas Sistem
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perekaman jejak digital perubahan nilai siswa, pembukaan kunci rapor, dan aktivitas administratif penting.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari aksi, pengguna, atau rincian aktivitas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-4 w-40">Waktu & Tanggal</th>
                <th className="py-3 px-4 w-48">Pengguna</th>
                <th className="py-3 px-3 w-40">Kode Aksi</th>
                <th className="py-3 px-3 w-28">Entitas</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {log.timestamp}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {log.userName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold font-mono text-emerald-800 dark:bg-slate-800 dark:text-emerald-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 capitalize">
                    {log.entityType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    Belum ada log aktivitas yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
