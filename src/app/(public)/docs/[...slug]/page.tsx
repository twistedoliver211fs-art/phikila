import { notFound } from "next/navigation";
import { getDocContent } from "@/lib/docs/docs-content";
import { getAdjacentDocs } from "@/lib/docs/docs-data";
import { DocsTOC } from "@/components/docs/DocsTOC";
import { DocsPagination } from "@/components/docs/DocsPagination";
import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const doc = getDocContent(slugStr);
  if (!doc) return { title: "Not Found — Decimal Docs" };
  return {
    title: `${doc.title} — Decimal Documentation`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const doc = getDocContent(slugStr);

  if (!doc) notFound();

  const { prev, next } = getAdjacentDocs(slugStr);

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <div className="min-w-0 flex-1">
        <DocsBreadcrumbs />

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            {doc.section}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {doc.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {doc.description}
          </p>
        </div>

        <div
          className="prose-custom mt-8"
          dangerouslySetInnerHTML={{ __html: doc.content }}
        />

        <DocsPagination prev={prev} next={next} />
      </div>

      {/* Right TOC */}
      <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-[240px] shrink-0 overflow-y-auto py-8 xl:block">
        <DocsTOC headings={doc.headings} />
      </aside>
    </div>
  );
}
