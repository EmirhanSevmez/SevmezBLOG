import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

type Comment = {
    id: string;
    content: string;
    created_at: string;
    author: { id: string; username: string };
};

type Post = {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author: { id: string; username: string; role: string };
    comments: Comment[];
};

export default function PostDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();

    const [post, setPost] = useState<Post | null>(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get(`/posts/${id}`)
            .then((res) => setPost(res.data))
            .catch(() => router.push("/"))
            .finally(() => setLoading(false));
    }, [id]);

    const submitComment = async () => {
        if (!comment.trim() || !post) return;
        try {
            const res = await api.post(`/posts/${post.id}/comments`, {
                content: comment,
            });
            setPost({
                ...post,
                comments: [...(post.comments || []), res.data],
            });
            setComment("");
        } catch (err) {
            alert("Yorum gönderilemedi");
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setPost({
                ...post!,
                comments: post!.comments.filter((c) => c.id !== commentId),
            });
        } catch {
            alert("Yorum silinemedi");
        }
    };

    const deletePost = async () => {
        if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;
        try {
            await api.delete(`/posts/${post!.id}`);
            router.push("/");
        } catch {
            alert("Post silinemedi");
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!post) {
        return <Layout><p>Post bulunamadı.</p></Layout>;
    }

    const canDelete =
        user?.id === post.author.id ||
        user?.role === "moderator" ||
        user?.role === "admin";

    const canComment =
        user?.role === "user" ||
        user?.role === "approved" ||
        user?.role === "moderator" ||
        user?.role === "admin";

    const canDeleteComment = (c: Comment) =>
        user?.id === c.author?.id ||
        user?.role === "moderator" ||
        user?.role === "admin";

    return (
        <Layout>
            <article className="mb-10">
                <div className="flex items-start justify-between mb-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline">{post.author.username}</Badge>
                            <span className="text-sm text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString("tr-TR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="h-1 w-12 bg-primary rounded-full mt-4" />
                    </div>
                    {canDelete && (
                        <Button variant="destructive" size="sm" onClick={deletePost} className="transition-all duration-200">
                            Sil
                        </Button>
                    )}
                </div>
                <div className="prose max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed animate-fade-in stagger-1">
                    {post.content}
                </div>
            </article>

            <section className="animate-fade-in stagger-2">
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold">Yorumlar</h2>
                    <Badge variant="secondary">{post.comments?.length || 0}</Badge>
                </div>

                {canComment && (
                    <div className="mb-6 space-y-2">
                        <Textarea
                            placeholder="Yorumunu yaz..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="transition-all duration-200 focus:shadow-md"
                        />
                        <Button onClick={submitComment} disabled={!comment.trim()} className="transition-all duration-200">
                            Gönder
                        </Button>
                    </div>
                )}

                {!post.comments || post.comments.length === 0 ? (
                    <p className="text-muted-foreground">Henüz yorum yok.</p>
                ) : (
                    <div className="space-y-3">
                        {post.comments.map((c, i) => (
                            <Card key={c.id} className={`animate-fade-in stagger-${Math.min(i + 1, 8)} hover:shadow-sm transition-shadow duration-200`}>
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm">{c.content}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs font-medium">{c.author.username}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(c.created_at).toLocaleDateString("tr-TR", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        {canDeleteComment(c) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteComment(c.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors duration-200"
                                            >
                                                Sil
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    );
}
