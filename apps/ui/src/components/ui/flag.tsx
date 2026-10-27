"use client";

import { countryNames } from "@/lib/geo";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import * as React from "react";

export type FlagCode = keyof typeof countryNames;
type FlagSource = string | ((code: string) => string);
type ParsedFlag = {
  viewBox: string;
  children: React.ReactNode;
};
type SvgElement = React.ReactElement<React.SVGProps<SVGSVGElement>>;
interface FlagProps extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  code: FlagCode;
}

const defaultSource =
  "https://cdn.jsdelivr.net/npm/@nordaun/flags@latest/flags/{code}.svg";

const FlagContext = React.createContext<FlagSource>(defaultSource);

function FlagProvider({
  src,
  children,
}: {
  src?: FlagSource;
  children: React.ReactNode;
}) {
  return (
    <FlagContext.Provider value={src || defaultSource}>
      {children}
    </FlagContext.Provider>
  );
}

function resolveFlagUrl(src: FlagSource, code: string) {
  if (typeof src === "function") return src(code);
  const encoded = encodeURIComponent(code);
  return src.replace(/\{code\}/g, () => encoded);
}

function parseFlag(markup: string): ParsedFlag {
  const clean = DOMPurify.sanitize(markup, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });

  const root = React.Children.toArray(parse(clean, { trim: true })).find(
    (node): node is SvgElement =>
      React.isValidElement(node) && node.type === "svg",
  );

  if (!root) throw new Error("Failed to parse flag: Invalid flag SVG");

  return {
    viewBox: root.props.viewBox ?? "0 0 36 36",
    children: root.props.children,
  };
}

const flagCache = new Map<string, ParsedFlag>();
const pendingFlags = new Map<string, Promise<ParsedFlag>>();

async function loadFlag(url: string): Promise<ParsedFlag> {
  const cached = flagCache.get(url);
  if (cached) return cached;

  const inflight = pendingFlags.get(url);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to load flag (${response.status}): ${url}`);

      const text = await response.text();
      const parsed = parseFlag(text);
      flagCache.set(url, parsed);
      return parsed;
    } finally {
      pendingFlags.delete(url);
    }
  })();

  pendingFlags.set(url, request);
  return request;
}

function Flag({ code, viewBox, ...props }: FlagProps) {
  const contextSource = React.useContext(FlagContext);
  const source = contextSource ?? defaultSource;

  const formattedCode = code?.toLowerCase();
  const url = formattedCode ? resolveFlagUrl(source, formattedCode) : null;

  const [, rerender] = React.useReducer((count: number) => count + 1, 0);
  const flag = url ? (flagCache.get(url) ?? null) : null;

  React.useEffect(() => {
    if (!url || flagCache.has(url)) return;

    let cancelled = false;

    async function fetchAndRender() {
      try {
        await loadFlag(url!);
        if (!cancelled) rerender();
      } catch (error) {
        console.error(error);
      }
    }

    fetchAndRender();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <svg
      viewBox={viewBox ?? flag?.viewBox ?? "0 0 36 36"}
      aria-hidden
      {...props}
    >
      {flag?.children}
    </svg>
  );
}

export { Flag, FlagProvider };
