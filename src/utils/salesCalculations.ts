import { SaleRecord, PaymentMethod, SaleStatus } from '../types/sale';

export interface SalesReportSummary {
  totalConfirmedRevenue: number;
  totalPendingRevenue: number;
  totalProjectedRevenue: number;
  totalCancelledRevenue: number;
  confirmedAttendees: number;
  pendingAttendees: number;
  totalAttendees: number;
  totalTransactions: number;
  confirmedTransactions: number;
  averageTicket: number;
  capacityTotal: number;
  spotsOccupiedPercentage: number;
  spotsRemaining: number;
  paymentMethodBreakdown: {
    method: PaymentMethod;
    label: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  ticketTypeBreakdown: {
    ticketType: string;
    count: number;
    attendees: number;
    amount: number;
    percentage: number;
  }[];
  statusBreakdown: {
    status: SaleStatus;
    label: string;
    count: number;
    amount: number;
  }[];
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX Instantâneo',
  credit_card: 'Cartão de Crédito',
  cash: 'Dinheiro em Espécie',
  bank_transfer: 'Transferência Bancária / TED',
  complimentary: 'Cortesia / Patrocinador',
};

export const STATUS_LABELS: Record<SaleStatus, string> = {
  confirmed: 'Confirmado / Pago',
  pending: 'Pendente / Aguardando',
  cancelled: 'Cancelado / Estornado',
};

export function formatCurrencyBRL(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(val || 0);
}

export function calculateSalesSummary(
  sales: SaleRecord[],
  capacityTotal: number = 500
): SalesReportSummary {
  let totalConfirmedRevenue = 0;
  let totalPendingRevenue = 0;
  let totalCancelledRevenue = 0;
  let confirmedAttendees = 0;
  let pendingAttendees = 0;
  let confirmedTransactions = 0;

  const paymentMap: Record<PaymentMethod, { count: number; amount: number }> = {
    pix: { count: 0, amount: 0 },
    credit_card: { count: 0, amount: 0 },
    cash: { count: 0, amount: 0 },
    bank_transfer: { count: 0, amount: 0 },
    complimentary: { count: 0, amount: 0 },
  };

  const ticketTypeMap: Record<string, { count: number; attendees: number; amount: number }> = {};
  const statusMap: Record<SaleStatus, { count: number; amount: number }> = {
    confirmed: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    cancelled: { count: 0, amount: 0 },
  };

  for (const s of sales) {
    const attendees = Number(s.attendeesCount) || 1;
    const amount = Number(s.amount) || 0;

    // Status map
    if (statusMap[s.status]) {
      statusMap[s.status].count += 1;
      statusMap[s.status].amount += amount;
    }

    if (s.status === 'confirmed') {
      totalConfirmedRevenue += amount;
      confirmedAttendees += attendees;
      confirmedTransactions += 1;

      // Payment map (only confirmed counts toward actual inflows)
      if (paymentMap[s.paymentMethod]) {
        paymentMap[s.paymentMethod].count += 1;
        paymentMap[s.paymentMethod].amount += amount;
      }

      // Ticket type map
      const typeKey = s.ticketType || 'Passaporte Oficial';
      if (!ticketTypeMap[typeKey]) {
        ticketTypeMap[typeKey] = { count: 0, attendees: 0, amount: 0 };
      }
      ticketTypeMap[typeKey].count += 1;
      ticketTypeMap[typeKey].attendees += attendees;
      ticketTypeMap[typeKey].amount += amount;
    } else if (s.status === 'pending') {
      totalPendingRevenue += amount;
      pendingAttendees += attendees;
    } else if (s.status === 'cancelled') {
      totalCancelledRevenue += amount;
    }
  }

  const totalProjectedRevenue = totalConfirmedRevenue + totalPendingRevenue;
  const averageTicket = confirmedAttendees > 0 ? totalConfirmedRevenue / confirmedAttendees : 0;
  const spotsOccupiedPercentage = Math.min(
    100,
    Math.round((confirmedAttendees / (capacityTotal || 1)) * 1000) / 10
  );
  const spotsRemaining = Math.max(0, capacityTotal - confirmedAttendees);

  const paymentMethodBreakdown = (
    Object.keys(paymentMap) as PaymentMethod[]
  ).map((method) => {
    const data = paymentMap[method];
    const percentage =
      totalConfirmedRevenue > 0
        ? Math.round((data.amount / totalConfirmedRevenue) * 1000) / 10
        : 0;
    return {
      method,
      label: PAYMENT_METHOD_LABELS[method],
      count: data.count,
      amount: data.amount,
      percentage,
    };
  });

  const ticketTypeBreakdown = Object.entries(ticketTypeMap).map(([ticketType, data]) => {
    const percentage =
      totalConfirmedRevenue > 0
        ? Math.round((data.amount / totalConfirmedRevenue) * 1000) / 10
        : 0;
    return {
      ticketType,
      count: data.count,
      attendees: data.attendees,
      amount: data.amount,
      percentage,
    };
  });

  const statusBreakdown = (Object.keys(statusMap) as SaleStatus[]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: statusMap[status].count,
    amount: statusMap[status].amount,
  }));

  return {
    totalConfirmedRevenue,
    totalPendingRevenue,
    totalProjectedRevenue,
    totalCancelledRevenue,
    confirmedAttendees,
    pendingAttendees,
    totalAttendees: confirmedAttendees + pendingAttendees,
    totalTransactions: sales.length,
    confirmedTransactions,
    averageTicket,
    capacityTotal,
    spotsOccupiedPercentage,
    spotsRemaining,
    paymentMethodBreakdown,
    ticketTypeBreakdown,
    statusBreakdown,
  };
}

export function exportSalesToCSV(sales: SaleRecord[], eventName = 'Performance 360º'): void {
  const headers = [
    'ID',
    'Nome do Participante',
    'E-mail',
    'Telefone / WhatsApp',
    'CPF',
    'Tipo de Ingresso',
    'Qtd Pessoas',
    'Valor Total (R$)',
    'Forma de Pagamento',
    'Status',
    'Origem',
    'Data/Hora',
    'Observações',
  ];

  const rows = sales.map((s) => [
    `"${s.id || ''}"`,
    `"${(s.customerName || '').replace(/"/g, '""')}"`,
    `"${(s.email || '').replace(/"/g, '""')}"`,
    `"${(s.phone || '').replace(/"/g, '""')}"`,
    `"${(s.cpf || '').replace(/"/g, '""')}"`,
    `"${(s.ticketType || '').replace(/"/g, '""')}"`,
    s.attendeesCount || 1,
    (s.amount || 0).toFixed(2).replace('.', ','),
    `"${PAYMENT_METHOD_LABELS[s.paymentMethod] || s.paymentMethod}"`,
    `"${STATUS_LABELS[s.status] || s.status}"`,
    `"${s.origin === 'online' ? 'Online (Site)' : 'Manual (Balcão)'}"`,
    `"${s.createdAt ? new Date(s.createdAt).toLocaleString('pt-BR') : ''}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `Relatorio_Vendas_${eventName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateWhatsAppSummary(summary: SalesReportSummary): string {
  const dateFormatted = new Date().toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return `📊 *RELATÓRIO DE VENDAS · PERFORMANCE 360º*
🏛 *Local:* Academia Dragon Gym
🕒 *Atualizado em:* ${dateFormatted}

━━━━━━━━━━━━━━━━━━━━
💰 *VALORES DE ENTRADA (CAIXA)*
• *Faturamento Confirmado:* ${formatCurrencyBRL(summary.totalConfirmedRevenue)}
• *Valores Pendentes:* ${formatCurrencyBRL(summary.totalPendingRevenue)}
• *Faturamento Projetado:* ${formatCurrencyBRL(summary.totalProjectedRevenue)}
• *Ticket Médio:* ${formatCurrencyBRL(summary.averageTicket)}

👥 *PÚBLICO & LOTAÇÃO*
• *Pessoas Confirmadas:* ${summary.confirmedAttendees} participantes
• *Capacidade Total:* ${summary.capacityTotal} vagas
• *Ocupação:* ${summary.spotsOccupiedPercentage}% (${summary.spotsRemaining} vagas livres)

💳 *ENTRADAS POR FORMA DE PAGAMENTO*
${summary.paymentMethodBreakdown
  .filter((p) => p.count > 0 || p.amount > 0)
  .map(
    (p) =>
      `• ${p.label}: ${formatCurrencyBRL(p.amount)} (${p.count} vendas · ${p.percentage}%)`
  )
  .join('\n')}

🎟 *INGRESSOS POR CATEGORIA*
${summary.ticketTypeBreakdown
  .map((t) => `• ${t.ticketType}: ${t.attendees} pessoas (${formatCurrencyBRL(t.amount)})`)
  .join('\n')}
━━━━━━━━━━━━━━━━━━━━
Relatório gerado pelo Painel de Gestão Performance 360º.`;
}
