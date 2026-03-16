import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
    const router = useRouter();
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await register(username, email, password);
            router.push("/");
        } catch (err: any) {
            console.error("Register error:", err);
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Kayıt başarısız";
            setError(msg);
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Kayıt Ol</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <div className="space-y-2">
                                <Label htmlFor="username">Kullanıcı Adı</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Şifre (min 6 karakter)</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                            </div>
                            <Button type="submit" className="w-full">Kayıt Ol</Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Zaten hesabın var mı? <Link href="/login" className="underline">Giriş yap</Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}