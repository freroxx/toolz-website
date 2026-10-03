import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function NewsLoginCard({ onLogin, loading }: { onLogin: (pw: string) => Promise<void>; loading: boolean }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <Card className="w-full rounded-[32px] border-white/10">
        <CardHeader className="text-center">
          <Badge className="mx-auto mb-2 w-fit rounded-full" variant="secondary">Material 3 Admin</Badge>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Toolz News Admin</CardTitle>
          <CardDescription>Password is verified server-side against NEWS_ADMIN_PASSWORD. 5 failures lock the IP for 15 minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          {err && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{err}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErr(null);
              try {
                await onLogin(pw);
              } catch (e2) {
                setErr(e2 instanceof Error ? e2.message : 'Login failed');
              }
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="news-pw">Admin password</Label>
              <div className="flex gap-2">
                <Input
                  id="news-pw"
                  type={show ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="NEWS_ADMIN_PASSWORD"
                  autoFocus
                  required
                  className="rounded-2xl"
                />
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setShow((s) => !s)}>
                  {show ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={loading || !pw} className="h-12 rounded-full text-base font-bold">
              {loading ? 'Unlocking…' : 'Unlock news admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
