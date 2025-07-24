'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthGuard from '../../../../../components/AuthGuard';
import Spinner from '../../../../../components/Spinner';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../context/AuthContext';

interface ApiBrand {
  id: number;
  name: string;
}

interface ApiFlavor {
  id: number;
  name: string;
  description: string;
  profile: string;
  brand: { id: number; name: string };
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

export default function FlavorEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      profile: '',
      brandId: '',
    },
  });

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('flavors:update');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ApiFlavor>(`/flavors/${params.id}`),
      api.get<ApiBrand[]>('/brands'),
    ])
      .then(([flavorRes, brandsRes]) => {
        const f = flavorRes.data;
        setValue('name', f.name);
        setValue('description', f.description || '');
        setValue('profile', f.profile || '');
        setValue('brandId', f.brand.id.toString());
        setBrands(brandsRes.data);
        setError('');
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [params.id]);

  const onSubmit = async (data: FormValues) => {
    setError('');
    try {
      await api.patch(`/flavors/${params.id}`, {
        ...data,
        brandId: Number(data.brandId),
      });
      router.push(`/flavors/${params.id}`);
    } catch (err) {
      setError('Не удалось сохранить вкус');
    }
  };

  if (!canEdit) {
    return (
      <AuthGuard>
        <p>У вас нет прав для редактирования вкусов.</p>
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
              <input
                type="text"
                placeholder="Описание"
                {...register('description')}
                className="w-full p-2 bg-[#1E1E1E] rounded"
              />
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
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
