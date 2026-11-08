import { describe, expect, it } from 'vitest';
import { DEFAULT_HOSTS, urlOk } from '../../api/news-admin';

describe('News Action URL validation (urlOk)', () => {
  it('allows discord URLs and discord:// scheme', () => {
    expect(urlOk('https://discord.gg/abc1234', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://discord.com/invite/abc1234', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://discordapp.com/channels/123/456', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('discord://guild/123456789', DEFAULT_HOSTS)).toBeNull();
  });

  it('allows owner vercel app subdomains (toolz, frerox, downloadz, etc.)', () => {
    expect(urlOk('https://toolz.vercel.app', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://toolz.vercel.app/news', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://frerox.vercel.app', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://downloadz.vercel.app', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://toolz-app.vercel.app', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://any-custom-subdomain.vercel.app/path', DEFAULT_HOSTS)).toBeNull();
  });

  it('allows toolz:// deep links', () => {
    expect(urlOk('toolz://settings/cleaner', DEFAULT_HOSTS)).toBeNull();
  });

  it('allows github, social, and standard media hosts', () => {
    expect(urlOk('https://github.com/frerox', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://freroxx.github.io/project', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://t.me/toolz_channel', DEFAULT_HOSTS)).toBeNull();
    expect(urlOk('https://x.com/toolz', DEFAULT_HOSTS)).toBeNull();
  });

  it('rejects un-allowlisted or dangerous URLs', () => {
    expect(urlOk('https://malicious-site.com/phishing', DEFAULT_HOSTS)).toContain('host not allowlisted');
    expect(urlOk('javascript:alert(1)', DEFAULT_HOSTS)).toBe('forbidden scheme');
    expect(urlOk('http://toolz.vercel.app', DEFAULT_HOSTS)).toContain('must be https://');
  });
});
