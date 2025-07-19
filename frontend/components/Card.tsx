interface CardProps {
  title: string;
  value: number | string;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-[#1E1E1E] p-4 rounded shadow text-center">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
