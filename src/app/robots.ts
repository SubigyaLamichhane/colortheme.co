import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/palettes"],
        // later: disallow: ["/palette/"] for individual palette pages
      },
    ],
    sitemap: "https://colortheme.co/sitemap.xml",
  };
}
