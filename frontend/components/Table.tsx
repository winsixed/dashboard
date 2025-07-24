import StatusBadge from './StatusBadge';

interface Request {
  id: number;
  status: string;
  createdAt?: string;
  user: { name: string };
  comment: string;
  flavors: string[];
}

interface TableProps {
  requests: Request[];
  showDetails?: boolean;
}

export default function Table({ requests, showDetails = false }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
        <thead>
          <tr>
            {showDetails && <th className="p-2">ID</th>}
            <th className="p-2">Status</th>
            {showDetails && <th className="p-2">Created At</th>}
            <th className="p-2">User</th>
            <th className="p-2">Comment</th>
            <th className="p-2">Flavors</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr
              key={r.id}
              className="border-t border-gray-700 flex flex-col sm:table-row"
            >
              {showDetails && <td className="p-2">{r.id}</td>}
              <td className="p-2">
                <StatusBadge status={r.status} />
              </td>
              {showDetails && (
                <td className="p-2">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                </td>
              )}
              <td className="p-2">{r.user.name}</td>
              <td className="p-2">{r.comment}</td>
              <td className="p-2">{r.flavors.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
