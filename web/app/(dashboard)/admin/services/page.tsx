"use client";

import { useEffect, useState } from "react";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { useSupabaseContext } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceSummary } from "@/types/service";

export default function AdminServicesPage() {
  const { client, profile } = useSupabaseContext();
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [inactiveServices, setInactiveServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [editPrice, setEditPrice] = useState(0);
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      setError(null);
      if (!client || !profile?.tenantId) {
        if (active) {
          setLoading(false);
          setError("İşletme bilgisi bulunamadı (tenant_id eksik).");
        }
        return;
      }

      const { data, error: fetchError } = await client
        .from("services")
        .select("id,name,duration_minutes,price,description,is_active")
        .eq("tenant_id", profile.tenantId)
        .order("name", { ascending: true });

      if (!active) return;

      if (fetchError) {
        setError(`Hizmetler yüklenemedi: ${fetchError.message}`);
        setServices([]);
        setInactiveServices([]);
      } else {
        const mapped = (data ?? []).map((item) => ({
          id: item.id as string,
          name: item.name as string,
          durationMinutes: item.duration_minutes as number,
          price: Number(item.price ?? 0),
          description: (item.description as string | null) ?? null,
          isActive: item.is_active as boolean,
        }));
        setServices(
          mapped
            .filter((item) => item.isActive)
            .map((item) => ({
              id: item.id,
              name: item.name,
              durationMinutes: item.durationMinutes,
              price: item.price,
              description: item.description,
            }))
        );
        setInactiveServices(
          mapped
            .filter((item) => !item.isActive)
            .map((item) => ({
              id: item.id,
              name: item.name,
              durationMinutes: item.durationMinutes,
              price: item.price,
              description: item.description,
            }))
        );
      }

      setLoading(false);
    }

    void loadServices();

    return () => {
      active = false;
    };
  }, [client, profile?.tenantId]);

  async function onCreateService(data: {
    name: string;
    durationMinutes: number;
    price: number;
    description: string;
  }) {
    setError(null);
    setMessage(null);

    if (!client) {
      setError("Supabase bağlantısı bulunamadı.");
      return false;
    }
    if (!profile?.tenantId) {
      setError("İşletme kaydı bulunamadı (tenant_id eksik).");
      return false;
    }

    setSaving(true);
    const payload = {
      tenant_id: profile.tenantId,
      name: data.name.trim(),
      duration_minutes: data.durationMinutes,
      price: data.price,
      description: data.description.trim() || null,
      is_active: true,
    };

    const { data: inserted, error: insertError } = await client
      .from("services")
      .insert(payload)
      .select("id,name,duration_minutes,price,description")
      .single();

    if (insertError) {
      setError(`Hizmet kaydedilemedi: ${insertError.message}`);
      setSaving(false);
      return false;
    }

    setServices((prev) => [
      ...prev,
      {
        id: inserted.id as string,
        name: inserted.name as string,
        durationMinutes: inserted.duration_minutes as number,
        price: Number(inserted.price ?? 0),
        description: (inserted.description as string | null) ?? null,
      },
    ]);
    setMessage("Hizmet kaydedildi.");
    setSaving(false);
    return true;
  }

  function startEditing(service: ServiceSummary) {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDuration(service.durationMinutes);
    setEditPrice(service.price);
    setEditDescription(service.description ?? "");
    setError(null);
    setMessage(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditDuration(30);
    setEditPrice(0);
    setEditDescription("");
  }

  async function onUpdateService(serviceId: string) {
    setError(null);
    setMessage(null);

    if (!client || !profile?.tenantId) {
      setError("İşletme kaydı bulunamadı.");
      return;
    }

    setUpdatingId(serviceId);
    const payload = {
      name: editName.trim(),
      duration_minutes: editDuration,
      price: editPrice,
      description: editDescription.trim() || null,
    };

    const { data: updated, error: updateError } = await client
      .from("services")
      .update(payload)
      .eq("id", serviceId)
      .eq("tenant_id", profile.tenantId)
      .select("id,name,duration_minutes,price,description")
      .single();

    if (updateError) {
      setError(`Hizmet güncellenemedi: ${updateError.message}`);
      setUpdatingId(null);
      return;
    }

    setServices((prev) =>
      prev.map((item) =>
        item.id === serviceId
          ? {
              id: updated.id as string,
              name: updated.name as string,
              durationMinutes: updated.duration_minutes as number,
              price: Number(updated.price ?? 0),
              description: (updated.description as string | null) ?? null,
            }
          : item
      )
    );
    setMessage("Hizmet güncellendi.");
    setUpdatingId(null);
    cancelEditing();
  }

  async function onSoftDeleteService(serviceId: string) {
    setError(null);
    setMessage(null);

    if (!client || !profile?.tenantId) {
      setError("İşletme kaydı bulunamadı.");
      return;
    }

    setDeletingId(serviceId);
    const { error: deleteError } = await client
      .from("services")
      .update({ is_active: false })
      .eq("id", serviceId)
      .eq("tenant_id", profile.tenantId);

    if (deleteError) {
      setError(`Hizmet silinemedi: ${deleteError.message}`);
      setDeletingId(null);
      return;
    }

    const deletedService = services.find((item) => item.id === serviceId) ?? null;
    setServices((prev) => prev.filter((item) => item.id !== serviceId));
    if (deletedService) {
      setInactiveServices((prev) => [...prev, deletedService]);
    }
    setMessage("Hizmet pasife alındı.");
    setDeletingId(null);
    if (editingId === serviceId) {
      cancelEditing();
    }
  }

  async function onRestoreService(serviceId: string) {
    setError(null);
    setMessage(null);

    if (!client || !profile?.tenantId) {
      setError("İşletme kaydı bulunamadı.");
      return;
    }

    setRestoringId(serviceId);
    const { data: restored, error: restoreError } = await client
      .from("services")
      .update({ is_active: true })
      .eq("id", serviceId)
      .eq("tenant_id", profile.tenantId)
      .select("id,name,duration_minutes,price,description")
      .single();

    if (restoreError) {
      setError(`Hizmet geri alınamadı: ${restoreError.message}`);
      setRestoringId(null);
      return;
    }

    setInactiveServices((prev) => prev.filter((item) => item.id !== serviceId));
    setServices((prev) => [
      ...prev,
      {
        id: restored.id as string,
        name: restored.name as string,
        durationMinutes: restored.duration_minutes as number,
        price: Number(restored.price ?? 0),
        description: (restored.description as string | null) ?? null,
      },
    ]);
    setMessage("Hizmet yeniden aktifleştirildi.");
    setRestoringId(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hizmetler</h1>
          <p className="text-muted-foreground">Her hizmetin süresi ve fiyatı müşteri akışına yansır.</p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {loading ? <p className="text-sm text-muted-foreground">Hizmetler yükleniyor...</p> : null}
        <div className="grid gap-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <CardDescription>
                  {s.durationMinutes} dk ·{" "}
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(s.price)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {s.description ? (
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Açıklama yok.</p>
                )}
                {editingId === s.id ? (
                  <div className="space-y-3 rounded-md border p-3">
                    <div className="space-y-1">
                      <Label htmlFor={`edit-name-${s.id}`}>Hizmet adı</Label>
                      <Input
                        id={`edit-name-${s.id}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={updatingId === s.id}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`edit-duration-${s.id}`}>Süre (dk)</Label>
                        <Input
                          id={`edit-duration-${s.id}`}
                          type="number"
                          min={5}
                          step={5}
                          value={editDuration}
                          onChange={(e) => setEditDuration(Number(e.target.value))}
                          disabled={updatingId === s.id}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-price-${s.id}`}>Fiyat (TRY)</Label>
                        <Input
                          id={`edit-price-${s.id}`}
                          type="number"
                          min={0}
                          step={10}
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          disabled={updatingId === s.id}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`edit-desc-${s.id}`}>Açıklama</Label>
                      <Input
                        id={`edit-desc-${s.id}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        disabled={updatingId === s.id}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => void onUpdateService(s.id)}
                        disabled={updatingId === s.id}
                      >
                        {updatingId === s.id ? "Güncelleniyor..." : "Güncelle"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={updatingId === s.id}
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(s)}
                    disabled={deletingId === s.id || editingId !== null}
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void onSoftDeleteService(s.id)}
                    disabled={deletingId === s.id || editingId !== null}
                  >
                    {deletingId === s.id ? "Siliniyor..." : "Sil (pasife al)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz kayıtlı hizmet yok.</p>
          ) : null}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pasif hizmetler</CardTitle>
            <CardDescription>Pasife alınan hizmetleri buradan geri aktifleştirebilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inactiveServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pasif hizmet bulunmuyor.</p>
            ) : (
              inactiveServices.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.durationMinutes} dk ·{" "}
                      {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
                        s.price
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void onRestoreService(s.id)}
                    disabled={restoringId === s.id}
                  >
                    {restoringId === s.id ? "Geri alınıyor..." : "Geri aktif et"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Yeni hizmet</CardTitle>
          <CardDescription>Hizmet adı, süre ve fiyat bilgilerini ekleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm onSubmit={onCreateService} disabled={loading} submitting={saving} />
        </CardContent>
      </Card>
    </div>
  );
}
