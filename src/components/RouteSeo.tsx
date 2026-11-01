import { useLocation } from "react-router-dom";
import Seo, { SITE_URL, type SeoProps } from "./Seo";

type RouteMeta = Omit<SeoProps, "path" | "jsonLd"> & {
  /** Extra schema.org data appended for this route. */
  schema?: Record<string, unknown>;
};

const ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "Toolz — One home. All your tools.",
    description:
      "Toolz is a free, open-source Android utility suite: 50+ tools in one APK. Offline-first, encrypted vaults, no ads, no tracking.",
  },
  "/downloads": {
    title: "Download Toolz for Android — releases & download stats",
    description:
      "Download the latest Toolz APK for Android 12+. Browse every release, architecture-specific builds and live download counts. Free, open source, no tracking.",
  },
  "/spec": {
    title: "Phone specs catalog — search and compare devices | Toolz",
    description:
      "Search a live catalog of phone specifications. Filter by brand, open full spec sheets and compare up to three devices side by side.",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Toolz phone specs catalog",
      description:
        "A live, searchable catalog of phone hardware specifications with side-by-side comparison.",
      url: `${SITE_URL}/spec`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  },
  "/news": {
    title: "Toolz news & changelog — releases and updates",
    description:
      "Release notes, feature updates and project announcements from Toolz, the open-source Android utility suite.",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Toolz news & changelog",
      url: `${SITE_URL}/news`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  },
};

const ADMIN_ROUTES = ["/admin/news", "/admin/skins"];

const RouteSeo = () => {
  const { pathname } = useLocation();
  const meta = ROUTES[pathname];
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (meta) {
    return (
      <Seo
        title={meta.title}
        description={meta.description}
        path={pathname}
        type={meta.type}
        image={meta.image}
        jsonLd={meta.schema}
      />
    );
  }

  return (
    <Seo
      title={isAdmin ? "Toolz admin" : "Page not found — Toolz"}
      description={
        isAdmin
          ? "Internal Toolz administration page."
          : "This page does not exist. Browse Toolz downloads, the phone specs catalog and the latest project news."
      }
      path={pathname}
      noindex
    />
  );
};

export default RouteSeo;
