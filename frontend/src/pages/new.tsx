import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function NewPost() {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    // Rol kontrolü - approved+ değilse erişemesin
    if (!user) return <Layout><p>Giriş yapmalısın.</p></Layout>;
    if (user.role !== "approved" && user.role !== "moderator" && user.role !== "admin") {
        return <Layout><p>Post oluşturmak için onaylı kullanıcı olmalısın.</p></Layout>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/posts", { title, content });
            router.push(`/posts/${res.data.id}`);
        } catch (err: any) {
            console.error("Post error:", err);
            const msg = err?.response?.data?.error || err?.message || "Post oluşturulamadı";
            setError(msg);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Yeni Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <div className="space-y-2">
                                <Label htmlFor="title">Başlık</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">İçerik</Label>
                                <Textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Yayınla</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}