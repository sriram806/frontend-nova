'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminExamDetailRedirectPage() {
  const params = useParams<{ skillName: string }>();
  const router = useRouter();
  const skillName = decodeURIComponent(params.skillName);

  useEffect(() => {
    router.replace(`/exams/admin?exam=${encodeURIComponent(skillName)}`);
  }, [router, skillName]);

  return null;
}
