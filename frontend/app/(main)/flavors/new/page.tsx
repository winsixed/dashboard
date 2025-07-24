'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiBrand {
  id: number;
  name: string;
}

interface FormValues {
  name: string;
  description?: string | null;
  profile?: string | null;
  brandId: string;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  name: yup.string().required('Укажите название вкуса').min(2),
  brandId: yup.string().required('Выберите бренд'),
  profile: yup.string().nullable(),
  description: yup.string().nullable(),
});

export default function FlavorCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '', profile: '', brandId: '' },
  });

  useEffect(() => {
    api
      .get<ApiBrand[]>('/brands')
      .then(res => setBrands(res.data))
      .catch(() => setError('Не удалось загрузить бренды'))
      .finally(() => setLoading(false));
  }, []);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes('flavors:create');

  const onSubmit = async (data: FormValues) => {
    setError('');
    try {
      const res = await api.post('/flavors', {
        ...data,
        brandId: Number(data.brandId),
      });
      router.push(`/flavors/${res.data.id}`);
    } catch (err) {
      setError('Не удалось создать вкус');
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>У вас нет прав для создания вкусов.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : (
        <div className="p-4 max-w-screen-sm mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label className="block mb-1">Название</label>
              <input
                type="text"
                placeholder="Название вкуса"
                {...register('name')}
                className="w-full p-2 bg-[#1E1E1E] rounded"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">Описание</label>
              <textarea
                placeholder="Описание"
                {...register('description')}
                className="w-full p-2 bg-[#1E1E1E] rounded"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1">Профиль</label>
              <input
                type="text"
                placeholder="Профиль"
                {...register('profile')}
                className="w-full p-2 bg-[#1E1E1E] rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Бренд</label>
              <select
                {...register('brandId')}
                className="w-full p-2 bg-[#1E1E1E] rounded"
              >
                <option value="" disabled>
                  Выберите бренд
                </option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <p className="text-red-500 text-sm">{errors.brandId.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50 block mx-auto"
            >
              {isSubmitting ? 'Сохранение...' : 'Создать вкус'}
            </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}

