import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buildSharePath, encryptPayload, generatePin, HandoverPayload } from "@/lib/share";

const urgencyPresets = ["Routine", "Watch", "Time-Critical"] as const;
const alertPresets = ["Anticoag", "Falls risk", "Isolation"] as const;

const Index = () => {
  const [patientAlias, setPatientAlias] = useState("");
  const [room, setRoom] = useState("");
  const [issue, setIssue] = useState("");
  const [urgency, setUrgency] = useState<(typeof urgencyPresets)[number] | "">("");
  const [alerts, setAlerts] = useState<string[]>([]);
  const [pendingResults, setPendingResults] = useState("");
  const [todo, setTodo] = useState("");
  const [contact, setContact] = useState("");
  const [microStory, setMicroStory] = useState("");

  const [pin, setPin] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Create Handover | Handover DNA";
  }, []);

  const completion = useMemo(() => {
    const required = [patientAlias, issue, urgency, todo];
    const filled = required.filter(Boolean).length + (microStory ? 1 : 0);
    const total = 5; // 4 required + 1 optional nudge
    return Math.round((filled / total) * 100);
  }, [patientAlias, issue, urgency, todo, microStory]);

  const toggleAlert = (name: string) => {
    setAlerts((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleGenerate = () => {
    const payload: HandoverPayload = {
      patientAlias,
      room: room || undefined,
      issue,
      urgency,
      alerts,
      pendingResults: pendingResults || undefined,
      todo,
      contact: contact || undefined,
      microStory: microStory || undefined,
    };
    const p = generatePin();
    const cipher = encryptPayload(payload, p);
    const url = `${window.location.origin}${buildSharePath(cipher)}`;
    setPin(p);
    setShareUrl(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setPatientAlias("");
    setRoom("");
    setIssue("");
    setUrgency("");
    setAlerts([]);
    setPendingResults("");
    setTodo("");
    setContact("");
    setMicroStory("");
    setPin(null);
    setShareUrl(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8 max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Handover DNA (MVP)</h1>
          <p className="text-sm text-muted-foreground">SBAR + a tiny "Story So Far" and a QR to share. No accounts. Demo data only.</p>
        </header>

        {shareUrl && pin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Share via QR</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[200px_1fr] items-center">
              <div className="flex items-center justify-center rounded-md bg-card p-4 border">
                <QRCode value={shareUrl} size={160} />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Scan on mobile or open this link:</p>
                  <a className="text-sm text-primary break-all" href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">PIN:</span>
                  <span className="text-lg font-mono tracking-widest">{pin}</span>
                </div>
                <p className="text-sm text-muted-foreground">Keep this page open during the demo. Use Reset to clear.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>SBAR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm text-muted-foreground">{completion}%</span>
              </div>
              <Progress value={completion} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="alias" className="text-sm font-medium">Patient alias</label>
                <Input id="alias" placeholder="e.g., Mr Smith in bay 4" value={patientAlias} onChange={(e) => setPatientAlias(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="room" className="text-sm font-medium">Room/Bed</label>
                <Input id="room" placeholder="e.g., Bay 4-2" value={room} onChange={(e) => setRoom(e.target.value)} />
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-medium">S — Situation</h2>
              <div className="grid gap-2">
                <label htmlFor="issue" className="text-sm text-muted-foreground">Current issue</label>
                <Textarea id="issue" placeholder="e.g., Chest pain overnight; ECG pending." value={issue} onChange={(e) => setIssue(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {urgencyPresets.map((u) => (
                  <Button key={u} type="button" variant={urgency === u ? "default" : "secondary"} size="sm" onClick={() => setUrgency(u)}>
                    {u}
                  </Button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium">B — Background</h2>
              <div className="flex flex-wrap gap-2">
                {alertPresets.map((a) => (
                  <Button key={a} type="button" variant={alerts.includes(a) ? "default" : "secondary"} size="sm" onClick={() => toggleAlert(a)}>
                    {a}
                  </Button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium">A — Assessment</h2>
              <div className="grid gap-2">
                <label htmlFor="pending" className="text-sm text-muted-foreground">Pending results</label>
                <Textarea id="pending" placeholder="e.g., FBC, U+E at 06:00; CT chest report." value={pendingResults} onChange={(e) => setPendingResults(e.target.value)} />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium">R — Recommendation</h2>
              <div className="grid gap-2">
                <label htmlFor="todo" className="text-sm text-muted-foreground">Overnight to-do</label>
                <Textarea id="todo" placeholder="e.g., If chest pain recurs → repeat ECG; page med reg if ST changes." value={todo} onChange={(e) => setTodo(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="contact" className="text-sm text-muted-foreground">Who to call</label>
                <Input id="contact" placeholder="e.g., Med reg ext 1234" value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-medium">Story So Far (≤140 chars)</h2>
              <Textarea
                maxLength={140}
                placeholder={"I'm worried about __ because __; if __ then __."}
                value={microStory}
                onChange={(e) => setMicroStory(e.target.value)}
              />
              <div className="text-right text-xs text-muted-foreground">{microStory.length}/140</div>
            </section>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
              <Button type="button" onClick={handleGenerate} disabled={!patientAlias || !issue || !urgency || !todo}>Generate QR</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Index;
