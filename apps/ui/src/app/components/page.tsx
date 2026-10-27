import { Metadata } from "next";
import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import registry from "@/registry";

export const metadata: Metadata = {
  title: "Components",
  description: "Simple components for your extraordinary creations.",
};

export default function ComponentsPage() {
  return (
    <div className="flex flex-col w-full gap-4">
      <h1 className="text-3xl font-semibold">Components</h1>
      <h2 className="text-muted-foreground">
        Here you can find all the components available in the registry. We are
        working on adding more components.
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {registry.items.map((item) => (
          <Link href={`/components/${item.name}`} key={item.name}>
            <Card className="border-px p-4 bg-card/70 gap-1.5">
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
