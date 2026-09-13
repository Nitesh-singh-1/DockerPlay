import React from 'react';
import type { Metadata } from 'next';
import { CURRICULUM_CHAPTERS } from '@/data/curriculum';
import { ChapterView } from '@/components/curriculum/ChapterView';

export function generateStaticParams() {
  const params: { chapterId: string }[] = [];
  for (const ch of CURRICULUM_CHAPTERS) {
    params.push({ chapterId: ch.slug });
    params.push({ chapterId: ch.id });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}): Promise<Metadata> {
  const { chapterId } = await params;
  const chapter =
    CURRICULUM_CHAPTERS.find((c) => c.slug === chapterId || c.id === chapterId) ||
    CURRICULUM_CHAPTERS[0];

  return {
    title: `${chapter.title} — Docker Interactive Tutorial (Chapter ${chapter.order})`,
    description: `${chapter.summary} Practice real Docker commands for ${chapter.tagline.toLowerCase()} directly in your browser.`,
    alternates: {
      canonical: `https://dockerplay.org/curriculum/${chapter.slug}/`,
    },
    openGraph: {
      title: `${chapter.title} | DockerPlay Interactive Curriculum`,
      description: chapter.summary,
      url: `https://dockerplay.org/curriculum/${chapter.slug}/`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${chapter.title} | DockerPlay`,
      description: chapter.summary,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <ChapterView chapterId={chapterId} />;
}
