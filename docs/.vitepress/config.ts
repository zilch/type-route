import { defineConfig } from "vitepress";
import fs from "fs";
import path from "path";
import { escapeRegExp, first, startCase, times } from "lodash";
import fm from "front-matter";

interface SidebarItem {
  text: string;
  items: SidebarItem[];
  link?: string;
  activeMatch?: string;
}

const introSidebarItems = createSidebar(["docs", "introduction"]);
const guidesSidebarItems = createSidebar(["docs", "guides"]);
const apiReferenceSidebarItems = createSidebar(["docs", "api-reference"]);

export default defineConfig({
  lang: "en-US",
  title: "Type Route",
  titleTemplate: "The flexible, type safe routing library.",
  description: "The flexible, type safe routing library.",
  appearance: false,
  cleanUrls: "with-subfolders",
  head: [
    ["script", { src: "/codesandbox.js" }],
    ["script", { src: "/index.js" }],
  ],
  themeConfig: {
    logo: "./logo.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/zilch/type-route" },
    ],
    footer: {
      message: `Type Route is a Zilch project`,
      copyright: "Copyright © 2022",
    },
    nav: [
      {
        text: "Documentation",
        link: "/introduction/getting-started",
        activeMatch: "^\\/.+",
      },
      {
        text: "Playground ↗",
        link: "/#try-on-codesandbox",
      },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: introSidebarItems,
      },
      {
        text: "Guides",
        items: guidesSidebarItems,
      },
      {
        text: "API Reference",
        items: apiReferenceSidebarItems,
      },
    ],
    editLink: {
      pattern: "https://github.com/zilch/type-route/edit/main/docs/:path",
      text: "Edit Page",
    },
  },
});

function createSidebar(pathSegments: string[]): SidebarItem[] {
  const fullPath = path.resolve(...pathSegments);
  const entries = fs.readdirSync(fullPath);

  const items: SidebarItem[] = [];

  for (const entry of entries) {
    if (entry === "index.md" && pathSegments.length === 0) {
      continue;
    }

    const entryPath = path.resolve(fullPath, entry);
    const stat = fs.statSync(entryPath);

    if (stat.isDirectory()) {
      const subItems = createSidebar([...pathSegments, entry]);
      if (subItems.length > 0) {
        items.push({
          text: startCase(entry),
          items: subItems,
        });
      }
    } else if (entry.endsWith(".md")) {
      const title =
        fm<{ title?: string }>(fs.readFileSync(entryPath).toString()).attributes
          .title ?? startCase(entry.slice(0, -3));
      const link =
        "/" + [...pathSegments, entry.slice(0, -3)].slice(1).join("/");
      items.push({
        text: title,
        items: [],
        link,
        activeMatch: "$" + escapeRegExp(link) + "^",
      });
    }
  }

  return items;
}
