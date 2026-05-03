'use client';

import { useParams } from 'next/navigation';
import { AdminExamDetailPage } from '@/components/exams/admin-exam-detail-page';

export default function ExamQuestionsPage() {
  const params = useParams();
  const skillName = params.skill as string;

  return (
    <div className="pb-12">
      <AdminExamDetailPage skillName={skillName} />
    </div>
  );
}
