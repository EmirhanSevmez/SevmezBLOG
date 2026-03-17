import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

type Post = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  author: {
    username: string;
    role: string;
  };
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts")
      .then((res) => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight mb-2">SevmezBLOG</h1>
        <p className="text-muted-foreground text-lg">Düşünceler, fikirler ve daha fazlası.</p>
        <div className="h-1 w-16 bg-primary rounded-full mt-4" />
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">Henüz yazı yok.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className={`group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="transition-colors duration-200 group-hover:bg-primary/5">
                      {post.author.username}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
