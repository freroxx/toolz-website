import { useState } from 'react';
import { m } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

/**
 * Auth gate for the admin dashboard. Tonal M3 card on the plain surface — same
 * corner scale as the rest of the panel (24px), entrance is one soft spring.
 */
export function NewsLoginCard({ onLogin, loading }: { onLogin: (pw: string) => Promise<void>; loading: boolean }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full"
      >
        <Card className="w-full rounded-3xl border-[hsl(var(--md-outline-variant)/0.6)] bg-[hsl(var(--md-surface-container-low))]">
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 w-fit rounded-full border-transparent bg-[hsl(var(--md-primary-container))] text-[hsl(var(--md-on-primary-container))]" variant="secondary">
              Material 3 Admin
            </Badge>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Toolz News Admin</CardTitle>
            <CardDescription>Password is verified server-side against NEWS_ADMIN_PASSWORD. 5 failures lock the IP for 15 minutes.</CardDescription>
          </CardHeader>
          <CardContent>
            {err && <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold text-[hsl(var(--md-on-error-container))] bg-[hsl(var(--md-error-container))]" role="alert">{err}</div>}
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
                    className="rounded-xl"
                  />
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShow((s) => !s)}>
                    {show ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={loading || !pw} className="h-12 rounded-xl text-base font-bold">
                {loading ? 'Unlocking…' : 'Unlock news admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
