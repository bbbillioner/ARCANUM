import type { HomepageLesson } from "@/types/home";

import { Card } from "./card";

type LearningCardProps = {
  lesson: HomepageLesson;
};

export function LearningCard({ lesson }: LearningCardProps) {
  return (
    <Card eyebrow={lesson.level} title={lesson.title}>
      <p className="text-sm leading-6 text-zinc-400">{lesson.summary}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-300"
          style={{ width: `${lesson.progress}%` }}
        />
      </div>
    </Card>
  );
}
