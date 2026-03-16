import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

type User = {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
};

const roles = ["visitor", "user", "approved", "moderator", "admin"];

export default function AdminUsers() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/users")
            .then((res) => setUsers(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const changeRole = async (targetId: string, newRole: string) => {
        try {
            await api.put(`/admin/users/${targetId}/role`, { role: newRole });
            setUsers(users.map((u) =>
                u.id === targetId ? { ...u, role: newRole } : u
            ));
        } catch {
            alert("Rol değiştirilemedi");
        }
    };

    if (!user || (user.role !== "moderator" && user.role !== "admin")) {
        return <Layout><p>Bu sayfaya erişim yetkiniz yok.</p></Layout>;
    }

    if (loading) {
        return <Layout><p className="text-muted-foreground">Yükleniyor...</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>

            <div className="space-y-3">
                {users.map((u) => (
                    <Card key={u.id}>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{u.username}</p>
                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge>{u.role}</Badge>
                                    {user.role === "admin" && u.id !== user.id && (
                                        <select
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            className="text-sm border rounded px-2 py-1 bg-background"
                                        >
                                            {roles.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Layout>
    );
}