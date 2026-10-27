import { Metadata } from "next";
import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import packages from "@/packages";

export const metadata: Metadata = {
  title: "Packages",
  description: "Simple packages for your extraordinary creations.",
};

export default function PackagesPage() {
  return (
    <div className="flex flex-col w-full gap-4">
      <h1 className="text-3xl font-semibold">Packages</h1>
      <h2 className="text-muted-foreground">
        Here you can find all the packages available in the NPM registry. We are
        working on adding more packages.
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {packages.items.map((item) => (
          <Link href={`/packages/${item.name}`} key={item.name}>
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
