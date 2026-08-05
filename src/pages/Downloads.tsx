import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useGithubDownloads, GithubRelease } from "@/hooks/use-github-downloads";
import { Download, ArrowLeft, RefreshCw, BarChart, Clock, Package, ExternalLink, Sparkles, Smartphone, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const RollingNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 2.5, ease: "circOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const RankingSection = ({ releases }: { releases: GithubRelease[] }) => {
  const topArchitectures = (() => {
    const stats: Record<string, number> = {};
    releases.forEach(r => {
      (r.assets || []).forEach(a => {
        const name = a.name.toLowerCase();
        let abi = "";
        if (name.includes("arm64")) abi = "arm64-v8a";
        else if (name.includes("v7a") || name.includes("armv7")) abi = "armeabi-v7a";
        else if (name.includes("x86_64")) abi = "x86_64";
        else if (name.includes("x86")) abi = "x86";

        if (abi) {
          stats[abi] = (stats[abi] || 0) + (a.download_count || 0);
        }
      });
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  })();

  const topVersions = [...releases]
    .map(r => ({
      name: r.name || r.tag_name,
      count: (r.assets || []).reduce((sum, a) => sum + (a.download_count || 0), 0)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
      {/* Top Architectures */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="m3-card-outlined p-6 flex flex-col gap-4"
      >
        <h3 className="m3-title-medium flex items-center gap-2 text-on-surface">
          <Smartphone size={18} className="text-primary" />
          Top Architectures
        </h3>
        <div className="space-y-3">
          {topArchitectures.map(([abi, count], i) => (
            <div key={abi} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="m3-body-medium text-on-surface-variant font-mono">{abi}</span>
              </div>
              <span className="m3-label-large text-on-surface font-bold">{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Versions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="m3-card-outlined p-6 flex flex-col gap-4"
      >
        <h3 className="m3-title-medium flex items-center gap-2 text-on-surface">
          <Layers size={18} className="text-secondary" />
          Popular Releases
        </h3>
        <div className="space-y-3">
          {topVersions.map((v, i) => (
            <div key={v.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-[10px] font-bold text-secondary">
                  {i + 1}
                </span>
                <span className="m3-body-medium text-on-surface-variant">{v.name}</span>
              </div>
              <span className="m3-label-large text-on-surface font-bold">{v.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ReleaseCard = ({ release }: { release: GithubRelease }) => {
  const assets = release.assets || [];
  const releaseTotal = assets.reduce((sum, asset) => sum + (asset.download_count || 0), 0);
  const date = new Date(release.published_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="m3-card-filled p-6 md:p-8 flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Package size={24} />
          </div>
          <div>
            <h3 className="m3-title-large text-on-surface">{release.name || release.tag_name}</h3>
            <div className="flex items-center gap-2 text-on-surface-variant opacity-70 m3-label-medium">
              <Clock size={14} />
              {date}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl self-start">
          <Download size={16} className="text-primary" />
          <span className="m3-title-medium font-bold text-primary">
            {releaseTotal.toLocaleString()}
          </span>
          <span className="m3-label-small text-primary/70 uppercase font-bold tracking-tight">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(release.assets || []).map((asset) => (
          <div
            key={asset.name}
            className="flex items-center justify-between p-4 rounded-xl bg-surface-container transition-all hover:bg-surface-container-high group"
          >
            <div className="flex flex-col min-w-0">
              <span className="m3-label-large text-on-surface truncate pr-2">{asset.name}</span>
              <span className="m3-label-small text-on-surface-variant opacity-60">
                {(asset.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="m3-body-medium font-mono text-primary/80">{asset.download_count.toLocaleString()}</span>
              <a
                href={asset.browser_download_url}
                className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <a
        href={release.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="m3-label-large text-primary hover:underline self-end flex items-center gap-1 mt-2"
      >
        View release on GitHub
        <ExternalLink size={14} />
      </a>
    </motion.div>
  );
};

const DownloadsPage = () => {
  const navigate = useNavigate();
  const { totalDownloads, isLoading, releases, refetch, isFetching } = useGithubDownloads();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background Expression */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[60%] h-[60%] opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(var(--md-primary)) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[50%] h-[50%] opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(var(--md-secondary)) 0%, transparent 70%)" }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-5xl">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 m3-label-large text-on-surface-variant hover:text-primary transition-colors mb-12 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </motion.button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m3-chip gap-2 bg-primary/10 text-primary border-primary/20"
            >
              <BarChart size={16} />
              Live Insights
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="m3-display-large text-on-surface"
            >
              Download <br />
              <span className="m3-gradient-text italic font-serif">Intelligence.</span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="m3-card-filled p-8 md:p-10 flex flex-col items-center bg-primary/5 border-primary/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading || isFetching || isRefreshing}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary transition-all hover:bg-primary/20 active:scale-90",
                  (isFetching || isRefreshing) && "animate-spin"
                )}
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="m3-display-large font-black tracking-tighter text-primary text-6xl md:text-8xl">
              {isLoading ? "..." : <RollingNumber value={totalDownloads} />}
            </div>
            <div className="m3-title-large font-bold text-on-surface-variant tracking-widest uppercase opacity-60">
              Total Reach
            </div>
            <div className="mt-6 flex items-center gap-2 text-primary m3-label-medium font-bold uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full">
              <Sparkles size={14} />
              Realtime
            </div>
          </motion.div>
        </div>

        {/* Rankings Section */}
        {!isLoading && releases && <RankingSection releases={releases} />}

        {/* Releases List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <h2 className="m3-headline-small text-on-surface">Release Breakdown</h2>
            <span className="m3-label-large text-on-surface-variant opacity-60">
              {releases?.length || 0} Releases tracked
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-[32px] bg-surface-container animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {releases?.map((release) => (
                <ReleaseCard key={release.tag_name} release={release} />
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-24 text-center">
          <p className="m3-body-medium text-on-surface-variant opacity-50 max-w-md mx-auto">
            Download statistics are fetched directly from the GitHub API and include all assets across all public releases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
