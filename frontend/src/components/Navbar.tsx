import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-lg text-foreground hover:text-primary transition-colors duration-300">
                        SevmezBLOG
                    </Link>
                    {user?.role === "approved" || user?.role === "moderator" || user?.role === "admin" ? (
                        <Link href="/new" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                            Yeni Post
                        </Link>
                    ) : null}
                    {(user?.role === "moderator" || user?.role === "admin") && (
                        <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                            Admin
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm">{user.username}</span>
                            <Badge variant="secondary">{user.role}</Badge>
                            <Button variant="outline" size="sm" onClick={logout} className="transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
                                Çıkış
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" size="sm" className="transition-all duration-200">Giriş</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="transition-all duration-200">Kayıt Ol</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
