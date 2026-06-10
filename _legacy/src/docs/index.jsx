import { DocumentationMd } from "../components/DocumentationMd";

const _docs = [
  {
    label: "Getting Started",
    path: "/docs",
    src: "/docs/Installation.md",
  },
  {
    label: "Architecture",
    path: "/docs/architecture",
    src: "/docs/Architecture.md",
  },
  {
    label: "Explorer",
    path: "/docs/explorer",
    src: "/docs/Explorer.md",
  },
];

export const docs = _docs.map((it) => ({
  ...it,
  element: <DocumentationMd src={it.src} docs={_docs} />,
}));
