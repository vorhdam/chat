import { promises as fs } from "fs";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import path from "path";

import { CodeBlock } from "@/components/blocks/code";
import { Installation } from "@/components/blocks/intallation";
import registry from "@/registry";
import config from "@repo/config";

type PageProps = {
  params: { name: string };
};

export async function generateStaticParams() {
  const components = registry.items.map((i) => i.name);
  return components.map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const component = registry.items.find((i) => i.name === name);
  if (!component) return { title: "404" };

  const properties = await import(`./demos/${component.name}.tsx`);

  return {
    title: component.title,
    description: component.description,
    authors: [{ name: "vorhdam", url: "https://github.com/vorhdam" }],
    publisher: config.name,
    keywords: properties.keywords || [
      "shadcn",
      "base ui",
      "react",
      "component",
    ],
    openGraph: {
      title: component.title,
      description: component.description,
      url: `${config.ui.baseURL}/components/${component.name}`,
      siteName: config.ui.name,
      images: [{ url: `${config.ui.baseURL}/og.png` }],
    },
  };
}

export default async function ComponentPage({ params }: PageProps) {
  const { name } = await params;
  const component = registry.items.find((i) => i.name === name);
  if (!component) return notFound();

  const filePath = path.join(
    process.cwd(),
    "/src/app/components/[name]/demos",
    `${component.name}.tsx`,
  );
  const fileContent = await fs.readFile(filePath, "utf8");
  const match = fileContent.match(/\/\/ START([\s\S]*?)\/\/ END/);
  const code = match ? match[1]?.trim() : "";

  const Component = dynamic(() => import(`./demos/${component.name}.tsx`));

  return (
    <div className="flex flex-col w-full gap-8 max-w-2xl">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{component.title}</h1>
        <h2 className="text-muted-foreground max-w-xl">
          {component.description}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Preview</h2>
        <Component />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Installation</h2>
        <Installation name={component.name} type="component" />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Usage</h2>
        <CodeBlock
          directory={`/components/${component.name}-demo.tsx`}
          code={code}
        />
      </div>
    </div>
  );
}
