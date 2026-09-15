import { Sidebar } from "@/components/Sidebar";

export default function HandbookLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-[88rem] lg:flex">
      <details className="border-b border-line px-4 py-3 lg:hidden">
        <summary className="cursor-pointer font-display text-xs font-extrabold uppercase tracking-[0.18em] text-ink-soft">
          Handbook contents
        </summary>
        <Sidebar />
      </details>
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-line lg:block">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
