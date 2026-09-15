"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";
import { useProgress } from "@/lib/progress";

export function Certificate({
  courseSlug,
  courseTitle,
  hours,
  lessonSlugs,
  lessonTitles,
}: {
  courseSlug: string;
  courseTitle: string;
  hours: string;
  lessonSlugs: string[];
  lessonTitles: string[];
}) {
  const { ready, name, isDone } = useProgress();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  if (!ready) return null;

  const allDone = lessonSlugs.every((l) => isDone(`course/${courseSlug}/${l}`));

  if (!allDone || !name.trim()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Not quite yet
        </h1>
        <p className="mt-2 text-ink-soft">
          The certificate unlocks when every lesson in {courseTitle} is complete
          {!name.trim() && " and your name is set on the course page"}.
        </p>
        <Link
          href={`/courses/${courseSlug}`}
          className="mt-5 inline-block rounded-xl border-2 border-ink px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-widest text-ink hover:border-flame hover:text-flame"
        >
          Back to the course
        </Link>
      </div>
    );
  }

  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div
        id="certificate"
        className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-paper p-10 shadow-[8px_8px_0_0_var(--color-flame)] sm:p-14"
      >
        <Image
          src="/logos/dbt.svg"
          alt=""
          width={280}
          height={280}
          className="pointer-events-none absolute -bottom-16 -right-16 opacity-[0.05]"
        />
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.25em] text-flame">
          Certificate of completion
        </p>
        <p className="mt-8 text-sm text-ink-faint">This certifies that</p>
        <p className="mt-1 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
          {name}
        </p>
        <p className="mt-6 text-sm text-ink-faint">has completed the course</p>
        <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
          {courseTitle}
        </p>
        <p className="mt-1 font-mono text-xs text-ink-faint">
          {lessonTitles.length} lessons · {hours}
        </p>
        <ul className="mt-5 flex max-w-[58ch] flex-wrap gap-x-4 gap-y-1">
          {lessonTitles.map((t) => (
            <li key={t} className="font-mono text-[11px] text-ink-soft">
              ✓ {t}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="font-display text-sm font-extrabold text-ink">
              WNL handbook
            </p>
            <p className="font-mono text-[10px] text-ink-faint">
              WNL Analytics
            </p>
          </div>
          <p className="font-mono text-xs text-ink-soft">{date}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <button
          type="button"
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            setDownloadError(false);
            try {
              await downloadCertificatePdf({
                courseSlug,
                courseTitle,
                hours,
                lessonTitles,
                learnerName: name,
                date,
              });
            } catch {
              setDownloadError(true);
            } finally {
              setDownloading(false);
            }
          }}
          className="rounded-xl border-2 border-ink bg-ink px-6 py-3 font-display text-sm font-extrabold uppercase tracking-widest text-paper transition hover:border-flame hover:bg-flame"
        >
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </button>
        <Link
          href="/"
          className="rounded-xl border-2 border-ink px-6 py-3 font-display text-sm font-extrabold uppercase tracking-widest text-ink transition hover:border-flame hover:text-flame"
        >
          Next course →
        </Link>
      </div>
      {downloadError && (
        <p className="mt-3 text-center text-sm text-flame-deep" role="alert">
          The PDF could not be created. Please try the download again.
        </p>
      )}
    </div>
  );
}
