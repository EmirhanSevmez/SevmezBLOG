import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            router.push("/");
        } catch {
            setError("Email veya şifre hatalı");
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-8">
                <Card className="animate-fade-in shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Hesabınıza giriş yapın</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md animate-fade-in-down">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="transition-all duration-200 focus:shadow-md" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Şifre</Label>
                                <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="transition-all duration-200 focus:shadow-md" />
                            </div>
                            <Button type="submit" className="w-full transition-all duration-200 hover:shadow-md">Giriş</Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Hesabın yok mu?{" "}
                                <Link href="/register" className="text-primary underline-offset-4 hover:underline transition-all duration-200">
                                    Kayıt ol
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
