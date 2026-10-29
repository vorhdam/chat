import { Badge } from "@/components/ui/badge";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

export function Dependencies({
  dependencies,
  registryDependencies,
}: {
  dependencies: string[];
  registryDependencies: string[];
}) {
  if (dependencies?.length === 0 && registryDependencies?.length === 0)
    return <p className="text-muted-foreground">No dependencies</p>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {dependencies?.map((dep) => (
        <Badge
          key={dep}
          variant="default"
          className="font-mono text-xs"
          render={
            <Link href={`https://www.npmjs.com/package/${dep}`} target="_blank">
              {dep} <ArrowUpRightIcon data-icon="inline-end" />
            </Link>
          }
        />
      ))}
      {registryDependencies?.map((dep) => (
        <Badge
          key={dep}
          variant="secondary"
          className="font-mono text-xs"
          render={
            <Link
              href={`https://ui.shadcn.com/docs/components/base/${dep}`}
              target="_blank"
            >
              {dep} <ArrowUpRightIcon data-icon="inline-end" />
            </Link>
          }
        />
      ))}
    </div>
  );
}
