"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthGuard from "../../../components/AuthGuard";
import Spinner from "../../../components/Spinner";
import StatusBadge from "../../../components/StatusBadge";
import api from "../../../lib/api";

interface ApiRequest {
  id: number;
  status: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
  flavors: { id: number; name: string }[];
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiRequest[]>("/requests")
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-4">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
            <thead>
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created At</th>
                <th className="p-2">User</th>
                <th className="p-2">Flavors</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-gray-700">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    {r.createdBy.firstName} {r.createdBy.lastName}
                  </td>
                  <td className="p-2">{r.flavors.map((f) => f.name).join(", ")}</td>
                  <td className="p-2">
                    <Link
                      href={`/requests/${r.id}`}
                      className="px-2 py-1 bg-accent text-black rounded"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AuthGuard>
  );
}

