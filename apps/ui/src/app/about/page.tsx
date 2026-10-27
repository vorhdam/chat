import config from "@repo/config";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "A few words about our work and this project.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full gap-8 max-w-2xl">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">About</h1>
        <h2 className="text-muted-foreground">
          Here you can read about how we design and create our components and
          what you can expect from us in the future.
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Our approach</h2>
        <span>
          When we design these components we always try to make them very bare
          bones. This is because we want you to customize it further, by themes,
          colors or even editing the components themselves. We also think that
          making components modular{" "}
          <i>(basically allowing you to play LEGO with our subcomponents)</i> is
          what makes our components so user friendly. However designing
          components like this is not always easy. We have to think about how
          the subcomponents communicate changes to the parent component. We use
          contexts in almost all of our components to address this problem which
          may not be the fastest but it is the simples approach.
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Consistency</h2>
        <span>
          We really like the default look of shadcn as it is super easy to
          understand from the user's perspective. Our components try to
          replicate the look of these components as much as they can. This is
          why custom presets work so well on our components. We use shadcn
          components, colors and presets to build ours, so there is no suprise
          that the result is extremely compatible with the already existing
          components.
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Why do we make this?</h2>
        <span>
          It started out as a component library for our main project then we
          realised that many developers might need similar components that are
          not included in shadcn's library. So we did what any reasonable person
          would do. We made it opensource so you can enjoy it too. Now the
          project is under MIT license. Also me{" "}
          <i>(who is writing this page)</i> is a self-taught developer who
          learned a lot from open-source projects. So it is a win-win.
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Support our work</h2>
        <span>
          If you found this registry helpful please drop a star to our{" "}
          <Link
            href={config.ui.github.repository}
            className="text-primary underline"
          >
            Github Repo
          </Link>
          .
        </span>
      </div>
    </div>
  );
}
