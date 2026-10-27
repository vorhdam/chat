import config from "@repo/config";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "A few words about our work and this project.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full max-w-2xl typeset">
      <h1>About</h1>
      <p className="text-muted-foreground">
        Discover how we design and build our components, as well as what's on
        the horizon for our library.
      </p>
      <h2>Our approach</h2>
      <p>
        When building these components, our primary goal is to keep them clean
        and unstyled. By delivering a minimalist foundation, we empower you to
        customize every aspect—whether through themes, color tokens, or direct
        code edits. We strongly believe in modular architecture; giving you the
        freedom to assemble subcomponents like building blocks is what makes the
        developer experience so intuitive. Crafting architecture this flexible,
        however, brings unique challenges particularly managing how
        subcomponents communicate state back to the parent. To solve this, we
        rely heavily on React Context. While it might not always offer raw
        maximum speed, it provides the cleanest and most reliable API for your
        codebase.
      </p>
      <h2>Consistency</h2>
      <p>
        We're huge fans of the default design language pioneered by shadcn,
        largely because of its clarity and user-centric approach. We
        deliberately align our visual design with this ecosystem so that custom
        presets and existing styles translate seamlessly. By leveraging shadcn's
        foundational primitives, color scales, and design tokens, our library
        integrates effortlessly into your existing projects without unexpected
        style conflicts.
      </p>
      <h2>Why do we make this?</h2>
      <p>
        What began as an internal component library for our core product quickly
        evolved when we noticed a gap in the ecosystem for specific UI patterns
        not covered by shadcn. Naturally, we took the open-source route to share
        these tools with the broader developer community. Today, the project is
        open source under the MIT license. As a self-taught developer who built
        a career on open-source software, releasing this library is both a
        personal milestone and a way to give back.
      </p>
      <h2>Support our work</h2>
      <p>
        If this registry saves you time or helps your workflow, consider
        starring the repository on{" "}
        <Link
          href={config.ui.github.repository}
          className="text-primary underline"
        >
          Github
        </Link>
        . It goes a long way in supporting further development!
      </p>
    </div>
  );
}
