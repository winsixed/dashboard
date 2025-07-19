interface Request {
  id: number;
  status: string;
  user: { name: string };
  comment: string;
  flavors: string[];
}

export default function Table({ requests }: { requests: Request[] }) {
  return (
    <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
      <thead>
        <tr>
          <th className="p-2">Status</th>
          <th className="p-2">User</th>
          <th className="p-2">Comment</th>
          <th className="p-2">Flavors</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => (
          <tr key={r.id} className="border-t border-gray-700">
            <td className="p-2">{r.status}</td>
            <td className="p-2">{r.user.name}</td>
            <td className="p-2">{r.comment}</td>
            <td className="p-2">{r.flavors.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
