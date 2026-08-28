import React from 'react';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';
import { ChapterView } from '@/components/curriculum/ChapterView';

export function generateStaticParams() {
  const params: { chapterId: string }[] = [];
  for (const ch of CURRICULUM_CHAPTERS) {
    params.push({ chapterId: ch.id });
    params.push({ chapterId: ch.slug });
  }
  return params;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <ChapterView chapterId={chapterId} />;
}
