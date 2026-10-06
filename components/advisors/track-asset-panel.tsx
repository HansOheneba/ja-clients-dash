"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Muted, TextSmall } from "@/components/ui/typography";
import { filterTrackableAssets, type TrackableAsset } from "@/lib/market/trackable-assets";
import { BUCKET_LABELS, HOLDINGS_BUCKETS } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

function AssetOption({
  asset,
  selected,
  onSelect,
}: {
  asset: TrackableAsset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left",
        selected ? "border-brand-primary bg-brand-primary/5" : "border-transparent hover:bg-muted/60",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{asset.name}</span>
        <span className="block text-xs text-muted-foreground">{asset.kind}</span>
      </span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">{asset.symbol}</span>
    </button>
  );
}

export function TrackAssetPanel({
  clientId,
  onSaved,
  embedded = false,
}: {
  clientId: string;
  onSaved?: () => void;
  embedded?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<{ query: string; assets: TrackableAsset[] } | null>(null);
  const [selected, setSelected] = useState<TrackableAsset | null>(null);
  const [bucket, setBucket] = useState<PortfolioBucket>("growth");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const localOptions = useMemo(() => filterTrackableAssets(query), [query]);
  const needle = query.trim();
  const options =
    needle.length >= 2 && remote?.query === needle ? remote.assets : localOptions;

  useEffect(() => {
    if (needle.length < 2) return;

    const timer = window.setTimeout(() => {
      void fetch(`/api/market/symbols?q=${encodeURIComponent(needle)}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !Array.isArray(data.assets)) return;
          setRemote({ query: needle, assets: data.assets as TrackableAsset[] });
        })
        .catch(() => undefined);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [needle]);

  const groups = useMemo(
    () => [
      { label: "Stocks", assets: options.filter((asset) => asset.kind === "Stock") },
      { label: "Funds", assets: options.filter((asset) => asset.kind === "ETF") },
    ].filter((group) => group.assets.length > 0),
    [options],
  );

  async function trackAsset() {
    if (!selected) {
      setMessage("Choose an asset from the list.");
      return;
    }
    const shares = Number(quantity);
    if (!Number.isFinite(shares) || shares <= 0) {
      setMessage("Enter how many shares or units the client holds.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/holdings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket,
          ticker: selected.symbol,
          investment_name: selected.name,
          quantity: shares,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not track this asset");

      setQuantity("");
      setMessage(
        data.warning
          ? `${selected.symbol} saved. ${data.warning}`
          : data.updated
            ? `${selected.symbol} quantity updated.`
            : `${selected.name} is now tracked.`,
      );
      onSaved?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not track this asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={embedded ? "" : "rounded-xl border border-border bg-card p-4"}>
      {embedded ? null : (
        <>
          <TextSmall className="font-semibold">Track an asset</TextSmall>
          <Muted className="mb-4 text-sm">
            Choose a listed stock or fund. Enter how many shares or units the client holds and
            the value follows the market. Anything that is not on this list stays a manual update.
          </Muted>
        </>
      )}

      <div className="flex flex-col gap-1">
        <Label htmlFor="track-asset-search">Search for an asset</Label>
        <Input
          id="track-asset-search"
          value={query}
          placeholder="Apple, NVIDIA, S&P 500..."
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-border/70 p-1">
        {groups.length === 0 ? (
          <Muted className="px-3 py-6 text-sm">
            Nothing on the trackable list matches that. Use a manual value update for this holding.
          </Muted>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{group.label}</p>
              {group.assets.map((asset) => (
                <AssetOption
                  key={asset.symbol}
                  asset={asset}
                  selected={selected?.symbol === asset.symbol}
                  onSelect={() => setSelected(asset)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {selected ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Muted className="text-xs">Asset</Muted>
            <TextSmall className="font-medium">{selected.name}</TextSmall>
          </div>
          <div>
            <Muted className="text-xs">Type</Muted>
            <TextSmall className="font-medium">{selected.kind}</TextSmall>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="track-asset-bucket">Portfolio bucket</Label>
          <Select
            id="track-asset-bucket"
            value={bucket}
            onChange={(event) => setBucket(event.target.value as PortfolioBucket)}
          >
            {HOLDINGS_BUCKETS.map((item) => (
              <option key={item} value={item}>
                {BUCKET_LABELS[item]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="track-asset-quantity">Quantity / units</Label>
          <Input
            id="track-asset-quantity"
            type="number"
            min="0"
            step="any"
            placeholder="100"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        className="mt-4"
        disabled={saving || !selected}
        onClick={trackAsset}
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        Add holding
      </Button>
      {message ? <Muted className="mt-2 text-sm">{message}</Muted> : null}
    </div>
  );
}
