import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { decryptPayload, HandoverPayload } from "@/lib/share";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const View = () => {
  const { blob } = useParams();
  const [pin, setPin] = useState("");
  const [data, setData] = useState<HandoverPayload | null>(null);
  const [error, setError] = useState<string>("");

  const cipher = useMemo(() => {
    try {
      return blob ? decodeURIComponent(blob) : "";
    } catch {
      return blob || "";
    }
  }, [blob]);

  useEffect(() => {
    document.title = "View Handover | Handover DNA";
  }, []);

  const handleUnlock = () => {
    setError("");
    const result = decryptPayload(cipher, pin.trim());
    if (!result) {
      setError("Invalid PIN or link. Please try again.");
      setData(null);
      return;
    }
    setData(result);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8 max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Handover (Read-only)</h1>
          <p className="text-sm text-muted-foreground">Enter the 4-digit PIN to unlock.</p>
        </header>

        {!data && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Unlock Handover</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                <label className="text-sm text-muted-foreground" htmlFor="pin">PIN</label>
                <Input
                  id="pin"
                  inputMode="numeric"
                  pattern="\\d{4}"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end">
                <Button onClick={handleUnlock} disabled={pin.length !== 4}>Unlock</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{data.patientAlias || "Patient"}</span>
                {data.urgency && (
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                    {data.urgency}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.room && (
                <div>
                  <h3 className="text-sm font-medium">Room</h3>
                  <p className="text-sm text-muted-foreground">{data.room}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium">Situation</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.issue}</p>
              </div>
              {data.alerts?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium">Alerts</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.alerts.map((a) => (
                      <span key={a} className="inline-flex items-center rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.pendingResults && (
                <div>
                  <h3 className="text-sm font-medium">Pending Results</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.pendingResults}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium">Overnight To-Do</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.todo}</p>
              </div>
              {data.contact && (
                <div>
                  <h3 className="text-sm font-medium">Who to call</h3>
                  <p className="text-sm text-muted-foreground">{data.contact}</p>
                </div>
              )}
              {data.microStory && (
                <div>
                  <h3 className="text-sm font-medium">Story So Far</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.microStory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default View;
