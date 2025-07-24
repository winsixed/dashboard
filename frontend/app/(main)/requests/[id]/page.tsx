'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
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
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<ApiRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    api
      .get<ApiRequest>(`/requests/${params.id}`)
      .then(res => {
        setRequest(res.data);
        setError('');
      })
      .catch(() => setError('Не удалось загрузить заявку'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [params.id]);

  const approve = async () => {
    try {
      await api.put(`/requests/${params.id}/status`, { status: 'approved' });
      toast.success('Заявка одобрена');
      fetchData();
    } catch (err) {
      toast.error('Не удалось обновить статус');
    }
  };

  const reject = async () => {
    try {
      await api.put(`/requests/${params.id}/status`, { status: 'rejected' });
      toast.success('Заявка отклонена');
      fetchData();
    } catch (err) {
      toast.error('Не удалось обновить статус');
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/requests/${params.id}`);
      toast.success('Заявка удалена');
      router.push('/requests');
    } catch (err) {
      toast.error('Не удалось удалить заявку');
    }
  };

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canModerate = permissions.includes('requests:moderate');
  const canEdit = permissions.includes('requests:edit');

  return (
    <AuthGuard>
      {loading || !request ? (
        <Spinner />
      ) : (
        <div className="space-y-4 p-4 max-w-screen-sm mx-auto">
          {error && <p className="text-red-500">{error}</p>}
          <div className="bg-[#1E1E1E] p-4 rounded space-y-2 text-sm">
            <h1 className="text-xl font-bold mb-4">Заявка #{request.id}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32">ID</span>
              <span className="mt-1 sm:mt-0">{request.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32">Статус</span>
              <div className="mt-1 sm:mt-0">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start">
              <span className="font-semibold sm:w-32">Вкусы</span>
              <div className="mt-1 sm:mt-0 flex flex-wrap gap-1">
                {request.flavors.map(f => (
                  <span
                    key={f.id}
                    className="bg-[#2A2A2A] px-2 py-0.5 rounded text-xs"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32">Создатель</span>
              <span className="mt-1 sm:mt-0">
                {request.createdBy.firstName} {request.createdBy.lastName}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32">Создано</span>
              <span className="mt-1 sm:mt-0">
                {new Date(request.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start">
              <span className="font-semibold sm:w-32">Комментарий</span>
              <span className="mt-1 sm:mt-0 break-words">
                {request.comment || '-'}
              </span>
            </div>
          </div>
          {(canEdit || canModerate) && (
            <div className="space-x-2">
              {canEdit && (
                <Link
                  href={`/requests/${request.id}/edit`}
                  className="px-4 py-2 bg-accent text-black rounded"
                >
                  Редактировать
                </Link>
              )}
              {canModerate && (
                <>
                  <button
                    onClick={approve}
                    className="px-4 py-2 bg-green-600 text-black rounded"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={reject}
                    className="px-4 py-2 bg-red-600 text-black rounded"
                  >
                    Отклонить
                  </button>
                  <button
                    onClick={remove}
                    className="px-4 py-2 bg-red-800 text-black rounded"
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </AuthGuard>
  );
}
