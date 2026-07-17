"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Flame, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Holding } from "@/context/portfolio-context";

interface NewsItem {
  id: string;
  tradingCode: string;
  title: string;
  content?: string;
  date: string;
  url?: string;
}

export function NewsFeed({ holdings }: { holdings: Holding[] }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const holdingCodes = useMemo(
    () =>
      holdings.map((h) => h.tradingCode.toUpperCase()),
    [holdings]
  );

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/news", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch news");

        const data = await res.json();

        // Supports both:
        // { news: [...] }
        // [...]
        const allNews: NewsItem[] = Array.isArray(data)
          ? data
          : data.news ?? [];

        // Only show news for holdings
        const filtered = allNews.filter((item) =>
          holdingCodes.includes(item.tradingCode.toUpperCase())
        );

        setNews(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (holdings.length) {
      fetchNews();
    }
  }, [holdingCodes, holdings]);

  if (!holdings.length) return null;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Latest News
        </h2>

        <div className="text-sm text-muted-foreground">
          Loading news...
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Latest News
        </h2>

        <div className="text-sm text-muted-foreground">
          No recent announcements for your holdings.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Latest News
        </h2>

        <span className="text-sm text-muted-foreground">
          {news.length} announcement{news.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => {
          const date = new Date(item.date);

          const isHot =
            Date.now() - date.getTime() <
            1000 * 60 * 60 * 24;

          return (
            <a
              key={item.id}
              href={item.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="rounded bg-secondary px-2 py-1 text-xs font-bold">
                  {item.tradingCode}
                </span>

                {isHot && (
                  <span className="flex items-center text-xs font-medium text-orange-500">
                    <Flame className="mr-1 h-3 w-3" />
                    Trending
                  </span>
                )}
              </div>

              <h3 className="mb-2 font-semibold transition-colors group-hover:text-primary">
                {item.title}
              </h3>

              {item.content && (
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {item.content}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />

                  {isNaN(date.getTime())
                    ? item.date
                    : formatDistanceToNow(date, {
                        addSuffix: true,
                      })}
                </span>

                <span className="flex items-center">
                  DSE

                  <ExternalLink className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}