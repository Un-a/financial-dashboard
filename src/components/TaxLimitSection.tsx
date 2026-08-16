import { useTransactionStore } from '../stores/transactionStore';
import { useTaxLimitStore } from '../stores/taxLimitStore';
import { TaxLimitCard } from './TaxLimitCard';
import { PAUSAL_LIMIT_RSD, VAT_LIMIT_RSD } from '../lib/constants';

export const TaxLimitSection = () => {
  const invoices = useTransactionStore((state) => state.invoices);
  const getPausalLimitUsage = useTaxLimitStore((state) => state.getPausalLimitUsage);
  const getVatLimitUsage = useTaxLimitStore((state) => state.getVatLimitUsage);

  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];

  const pausalUsage = getPausalLimitUsage(invoices, currentYear);
  const vatUsage = getVatLimitUsage(invoices, today);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TaxLimitCard
        title="Annual revenue limit"
        subtitle="Calculated based on calendar year revenue."
        currentAmount={pausalUsage}
        limitAmount={PAUSAL_LIMIT_RSD}
        ceilingLabel="annual ceiling"
        theme="amber"
      />
      <TaxLimitCard
        title="VAT threshold monitoring"
        subtitle="Rolling 365 days calculation"
        currentAmount={vatUsage}
        limitAmount={VAT_LIMIT_RSD}
        ceilingLabel="threshold"
        theme="indigo"
      />
    </div>
  );
};