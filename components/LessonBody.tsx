import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { HeadingAnchors } from "@/components/HeadingAnchors";

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      if (isValidElement<{ children?: ReactNode }>(child))
        return textOf(child.props.children);
      return "";
    })
    .join("");
}

/** Render heading links before hydration so direct section links work immediately. */
export function LessonBody({ children }: { children: ReactNode }) {
  const seen = new Map<string, number>();
  const headings: { id: string; title: string }[] = [];
  const content = Children.map(children, (child) => {
    if (
      !isValidElement<{
        children?: ReactNode;
        id?: string;
        className?: string;
      }>(child) ||
      (child.type !== "h2" && child.type !== "h3")
    )
      return child;
    const title = textOf(child.props.children).trim();
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const id = child.props.id ?? (count === 1 ? base : `${base}-${count}`);
    if (child.type === "h2") headings.push({ id, title });
    return cloneElement(child, {
      id,
      className: `${child.props.className ?? ""} scroll-mt-24`,
    });
  });

  return (
    <>
      {headings.length > 2 ? (
        <nav
          aria-label="On this page"
          className="mb-8 rounded-xl border border-line bg-paper-warm/50 px-5 py-4"
        >
          <p className="!mt-0 !mb-2 font-display text-sm font-bold text-ink">
            On this page
          </p>
          <ol className="!my-0 grid gap-x-6 gap-y-1 !pl-5 text-sm sm:grid-cols-2">
            {headings.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`}>{title}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="rise rise-2">{content}</div>
      <HeadingAnchors />
    </>
  );
}
