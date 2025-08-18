interface SummaryCardProps {
  label: string;
  value?: number;
  icon: React.ReactNode;
  color: string;
}

const SummaryCard = ({ label, value, icon, color }: SummaryCardProps) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className={`h-8 w-8 text-${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-${color} text-2xl font-bold`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
