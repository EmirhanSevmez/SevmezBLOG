import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-lg">
                        Blog
                    </Link>
                    {user?.role === "approved" || user?.role === "moderator" || user?.role === "admin" ? (
                        <Link href="/new" className="text-sm text-muted-foreground hover:text-foreground">
                            Yeni Post
                        </Link>
                    ) : null}
                    {(user?.role === "moderator" || user?.role === "admin") && (
                        <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground">
                            Admin
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm">{user.username}</span>
                            <Badge variant="secondary">{user.role}</Badge>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Çıkış
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" size="sm">Giriş</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Kayıt Ol</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}