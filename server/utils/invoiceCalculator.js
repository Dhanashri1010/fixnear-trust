/**
 * Centralized Invoice Calculator
 * -----------------------------------------------------------
 * Single source of truth for all invoice amount calculations.
 * Never trust frontend totals — always call this server-side.
 *
 * Rules:
 *  totalAmount = baseAmount + extraAmount + platformFee
 *  platformCommission = round(totalAmount * commissionRate / 100)
 *  providerNet = max(0, totalAmount - platformFee - platformCommission)
 *
 * @param {Object} params
 * @param {number} params.baseAmount        Service base price (from Service model)
 * @param {number} [params.extraAmount=0]   Approved quotation extra amount
 * @param {number} [params.platformFee]     Snapshot fee from booking or settings
 * @param {number} [params.commissionRate]  Snapshot commission % from booking or settings
 * @param {Object} [params.settings]        Platform settings (used as fallback)
 * @returns {{
 *   baseAmount: number,
 *   extraAmount: number,
 *   platformFee: number,
 *   commissionRate: number,
 *   totalAmount: number,
 *   platformCommission: number,
 *   providerNet: number,
 * }}
 */
export const calculateInvoice = ({
  baseAmount,
  extraAmount = 0,
  platformFee,
  commissionRate,
  settings = {},
}) => {
  const base = Math.max(0, Number(baseAmount) || 0);
  const extra = Math.max(0, Number(extraAmount) || 0);
  const fee = Math.max(0, Number(platformFee ?? settings.platformFee ?? 20));
  const rate = Math.max(0, Math.min(100, Number(commissionRate ?? settings.platformCommissionPercent ?? 10)));

  const total = base + extra + fee;
  const commission = Math.round(total * (rate / 100));
  const providerNet = Math.max(0, total - fee - commission);

  return {
    baseAmount: base,
    extraAmount: extra,
    platformFee: fee,
    commissionRate: rate,
    totalAmount: total,
    platformCommission: commission,
    providerNet,
  };
};

export default calculateInvoice;
