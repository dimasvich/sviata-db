'use client';

import Loader from '@/components/ui/Loader';
import { baseUrl } from '@/http';
import { setTokens } from '@/utils/token';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const access = params.get('access');
  const refresh = params.get('refresh');
  const [status, setStatus] = useState(false);

  useEffect(() => {
    if (access && refresh) {
      setTokens(access, refresh);
      setStatus(true);
    }
  }, [access, refresh]);
  useEffect(() => {
    if (status) {
      router.replace('/');
    } 
  }, [status]);

  return <Loader />;
}
