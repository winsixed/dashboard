'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import Table from '../../../components/Table';

interface ApiRequest {
  id: number;
  status: string;
  createdAt: string;
  comment: string;
  createdBy: { firstName: string; lastName: string };
  flavors: { id: number; name: string }[];
}

const LIMIT = 10;

export default function RequestsPage() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api
      .get<ApiRequest[]>('/requests', {
        params: { status: status || undefined, offset, limit: LIMIT },
      })
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [status, offset]);

  const nextPage = () => setOffset(offset + LIMIT);
  const prevPage = () => setOffset(Math.max(0, offset - LIMIT));

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={e => {
              setOffset(0);
              setStatus(e.target.value);
            }}
            className="bg-[#1E1E1E] p-2 rounded"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <Table
            showDetails
            requests={requests.map(r => ({
              id: r.id,
              status: r.status,
              createdAt: r.createdAt,
              user: { name: `${r.createdBy.firstName} ${r.createdBy.lastName}` },
              comment: r.comment,
              flavors: r.flavors.map(f => f.name),
            }))}
          />
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={prevPage}
            disabled={offset === 0}
            className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={nextPage}
            className="px-4 py-2 bg-accent text-black rounded"
          >
            Next
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
