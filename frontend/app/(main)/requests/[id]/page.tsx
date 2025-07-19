'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import StatusBadge from '../../../../components/StatusBadge';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiRequest {
  id: number;
  status: string;
  createdAt: string;
  comment: string;
  createdBy: { firstName: string; lastName: string };
  flavors: { id: number; name: string }[];
}

export default function RequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<ApiRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api
      .get<ApiRequest>(`/requests/${params.id}`)
      .then(res => setRequest(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [params.id]);

  const approve = async () => {
    await api.put(`/requests/${params.id}/approve`);
    fetchData();
  };

  const reject = async () => {
    await api.put(`/requests/${params.id}/reject`);
    fetchData();
  };

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canApprove = permissions.includes('approve_requests');
  const canReject = permissions.includes('reject_requests');
  const showActions =
    request?.status === 'pending' && (canApprove || canReject);

  return (
    <AuthGuard>
      {loading || !request ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div className="bg-[#1E1E1E] p-4 rounded">
            <h1 className="text-xl font-bold mb-4">Request #{request.id}</h1>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-2 font-semibold">Status</td>
                  <td className="p-2">
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Created at</td>
                  <td className="p-2">
                    {new Date(request.createdAt).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">User</td>
                  <td className="p-2">
                    {request.createdBy.firstName} {request.createdBy.lastName}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Comment</td>
                  <td className="p-2">{request.comment || '-'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Flavors</td>
                  <td className="p-2">
                    {request.flavors.map(f => f.name).join(', ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {showActions && (
            <div className="space-x-2">
              {canApprove && (
                <button
                  onClick={approve}
                  className="px-4 py-2 bg-green-600 text-black rounded"
                >
                  Approve
                </button>
              )}
              {canReject && (
                <button
                  onClick={reject}
                  className="px-4 py-2 bg-red-600 text-black rounded"
                >
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </AuthGuard>
  );
}
