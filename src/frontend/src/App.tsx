import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowUp,
  BarChart2,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  DollarSign,
  Flame,
  Heart,
  Home,
  Loader2,
  MapPin,
  Square,
  Star,
  TrendingUp,
  Waves,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type {
  ComparableProperty,
  HouseFeatures,
  PredictionResult,
} from "./backend";
import { PriceChart } from "./components/PriceChart";
import { useActor } from "./hooks/useActor";

// suppress unused import warnings
const _Bath = Bath;

// ---- Helpers ----
function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// ---- Navbar ----
function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-border shadow-xs"
      data-ocid="navbar.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            EstimateHome<span className="text-primary">.ai</span>
          </span>
        </div>
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium"
          aria-label="Main navigation"
        >
          <a
            href="#top"
            className="text-foreground hover:text-primary transition-colors"
            data-ocid="navbar.link"
          >
            Home
          </a>
          <a
            href="#prediction"
            className="text-primary font-semibold border-b-2 border-primary pb-0.5"
            data-ocid="navbar.link"
          >
            Prediction
          </a>
          <a
            href="#trends"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-ocid="navbar.link"
          >
            Market Trends
          </a>
          <a
            href="#about"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-ocid="navbar.link"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-ocid="navbar.link"
          >
            Contact
          </a>
        </nav>
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          data-ocid="navbar.primary_button"
          onClick={() =>
            document
              .getElementById("prediction")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}

// ---- Form Defaults ----
const DEFAULT_FORM: HouseFeatures = {
  zipCode: "94102",
  sizeSqft: 1800,
  bedrooms: 3,
  bathrooms: 2,
  propertyType: "Single Family",
  yearBuilt: 2005,
  lotSizeSqft: 5000,
  hasPool: false,
  hasGarage: true,
  hasFireplace: false,
  recentlyRenovated: false,
};

// ---- Hero Section ----
function HeroSection() {
  const { actor } = useActor();

  const [form, setForm] = useState<HouseFeatures>(DEFAULT_FORM);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [comps, setComps] = useState<ComparableProperty[]>([]);

  const predictMutation = useMutation<PredictionResult, Error, HouseFeatures>({
    mutationFn: async (features) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.predictPrice(features);
    },
    onSuccess: async (data) => {
      setResult(data);
      if (actor) {
        const c = await actor.getComparableProperties(
          form.zipCode,
          form.sizeSqft,
        );
        setComps(c);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    predictMutation.mutate(form);
  };

  const setField = <K extends keyof HouseFeatures>(
    key: K,
    val: HouseFeatures[K],
  ) => setForm((prev) => ({ ...prev, [key]: val }));

  const sizeOptions = [
    500, 800, 1000, 1200, 1500, 1800, 2000, 2500, 3000, 3500, 4000, 5000,
  ];
  const lotOptions = [1000, 2500, 4000, 5000, 7500, 10000, 15000, 20000];
  const yearOptions = Array.from({ length: 14 }, (_, i) => 1950 + i * 5).concat(
    [2010, 2015, 2020, 2024],
  );

  const amenities: {
    key: keyof Pick<
      HouseFeatures,
      "hasPool" | "hasGarage" | "hasFireplace" | "recentlyRenovated"
    >;
    label: string;
    id: string;
  }[] = [
    { key: "hasPool", label: "Pool", id: "amenity-pool" },
    { key: "hasGarage", label: "Garage", id: "amenity-garage" },
    { key: "hasFireplace", label: "Fireplace", id: "amenity-fireplace" },
    {
      key: "recentlyRenovated",
      label: "Recently Renovated",
      id: "amenity-renovated",
    },
  ];

  const amenityIcons: Record<string, React.ReactNode> = {
    hasPool: <Waves className="w-3.5 h-3.5" />,
    hasGarage: <Car className="w-3.5 h-3.5" />,
    hasFireplace: <Flame className="w-3.5 h-3.5" />,
    recentlyRenovated: <Wrench className="w-3.5 h-3.5" />,
  };

  return (
    <section
      id="prediction"
      className="relative min-h-[780px] flex flex-col justify-center"
      style={{
        backgroundImage:
          "url('/assets/generated/hero-house.dim_1920x1080.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-white/60 uppercase tracking-widest text-sm font-semibold mb-2">
            AI-Powered Valuation
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight max-w-2xl">
            Instant House
            <br />
            Valuation
          </h1>
          <p className="text-white/70 mt-3 text-lg max-w-lg">
            Get a precise AI-generated estimate for any property in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Input Home Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="zip"
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      ZIP Code
                    </Label>
                    <Input
                      id="zip"
                      placeholder="e.g. 94102"
                      value={form.zipCode}
                      onChange={(e) => setField("zipCode", e.target.value)}
                      className="mt-1"
                      data-ocid="prediction.input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="size"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Home Size (sqft)
                      </Label>
                      <Select
                        value={String(form.sizeSqft)}
                        onValueChange={(v) => setField("sizeSqft", Number(v))}
                      >
                        <SelectTrigger
                          id="size"
                          className="mt-1"
                          data-ocid="prediction.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((s) => (
                            <SelectItem key={s} value={String(s)}>
                              {s.toLocaleString()} sqft
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="beds"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Bedrooms
                      </Label>
                      <Select
                        value={String(form.bedrooms)}
                        onValueChange={(v) => setField("bedrooms", Number(v))}
                      >
                        <SelectTrigger
                          id="beds"
                          className="mt-1"
                          data-ocid="prediction.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((b) => (
                            <SelectItem key={b} value={String(b)}>
                              {b} Bed{b > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="baths"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Bathrooms
                      </Label>
                      <Select
                        value={String(form.bathrooms)}
                        onValueChange={(v) => setField("bathrooms", Number(v))}
                      >
                        <SelectTrigger
                          id="baths"
                          className="mt-1"
                          data-ocid="prediction.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 1.5, 2, 2.5, 3, 3.5, 4, 5].map((b) => (
                            <SelectItem key={b} value={String(b)}>
                              {b} Bath{b > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="ptype"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Property Type
                      </Label>
                      <Select
                        value={form.propertyType}
                        onValueChange={(v) => setField("propertyType", v)}
                      >
                        <SelectTrigger
                          id="ptype"
                          className="mt-1"
                          data-ocid="prediction.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Single Family",
                            "Condo",
                            "Townhouse",
                            "Multi-Family",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="year"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Year Built
                      </Label>
                      <Select
                        value={String(form.yearBuilt)}
                        onValueChange={(v) => setField("yearBuilt", Number(v))}
                      >
                        <SelectTrigger
                          id="year"
                          className="mt-1"
                          data-ocid="prediction.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="lot"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Lot Size (sqft)
                      </Label>
                      <Select
                        value={String(form.lotSizeSqft)}
                        onValueChange={(v) =>
                          setField("lotSizeSqft", Number(v))
                        }
                      >
                        <SelectTrigger
                          id="lot"
                          className="mt-1"
                          data-ocid="prediction.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lotOptions.map((l) => (
                            <SelectItem key={l} value={String(l)}>
                              {l.toLocaleString()} sqft
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Amenities
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {amenities.map(({ key, label, id }) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <Checkbox
                            id={id}
                            checked={form[key]}
                            onCheckedChange={(v) => setField(key, Boolean(v))}
                            data-ocid="prediction.checkbox"
                          />
                          <Label
                            htmlFor={id}
                            className="flex items-center gap-1.5 cursor-pointer font-normal"
                          >
                            <span className="text-primary">
                              {amenityIcons[key]}
                            </span>
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5"
                    disabled={predictMutation.isPending}
                    data-ocid="prediction.submit_button"
                  >
                    {predictMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Calculate Estimated Price
                      </>
                    )}
                  </Button>

                  {predictMutation.isError && (
                    <p
                      className="text-destructive text-sm text-center"
                      data-ocid="prediction.error_state"
                    >
                      {predictMutation.error?.message ||
                        "Failed to get prediction"}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Results Card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <Card className="shadow-card border-0 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Your Estimated Home Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {!result && !predictMutation.isPending && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-center gap-4"
                      data-ocid="prediction.empty_state"
                    >
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Home className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          No estimate yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fill in your home details and click
                          <br />
                          &ldquo;Calculate Estimated Price&rdquo;
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {predictMutation.isPending && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 gap-4"
                      data-ocid="prediction.loading_state"
                    >
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-muted-foreground text-sm">
                        Analyzing market data...
                      </p>
                    </motion.div>
                  )}

                  {result && !predictMutation.isPending && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                      data-ocid="prediction.success_state"
                    >
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-1">
                          Estimated Value
                        </p>
                        <p className="font-display text-4xl font-bold text-foreground">
                          {formatPrice(result.estimatedPrice)}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Badge
                            className={`${
                              result.confidence >= 85
                                ? "bg-success/10 text-success"
                                : "bg-yellow-100 text-yellow-700"
                            } border-0 text-xs font-semibold`}
                          >
                            <ArrowUp className="w-3 h-3 mr-1" />
                            {result.confidence >= 85
                              ? "High"
                              : result.confidence >= 70
                                ? "Medium"
                                : "Low"}{" "}
                            ({result.confidence.toFixed(0)}%)
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            Price Range Low
                          </p>
                          <p className="font-semibold text-sm mt-0.5">
                            {formatPrice(result.priceRangeLow)}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            Price Range High
                          </p>
                          <p className="font-semibold text-sm mt-0.5">
                            {formatPrice(result.priceRangeHigh)}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            Comps Avg Price
                          </p>
                          <p className="font-semibold text-sm mt-0.5">
                            {formatPrice(result.compsAveragePrice)}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            Key Stats
                          </p>
                          <p className="font-semibold text-sm mt-0.5">
                            {Number(result.keyStatsCount)} factors
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Market Demand
                          </span>
                          <span className="font-semibold text-foreground">
                            {result.marketDemand.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={result.marketDemand} className="h-2" />
                      </div>

                      {result.priceHistory.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Price History
                          </p>
                          <PriceChart data={result.priceHistory} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {result && comps.length > 0 && <CompsSection comps={comps} />}
      </div>
    </section>
  );
}

// ---- Insights Strip ----
function InsightsStrip() {
  const insights = [
    { icon: <DollarSign className="w-4 h-4" />, label: "Price Estimate" },
    { icon: <Waves className="w-4 h-4" />, label: "Pool" },
    { icon: <Car className="w-4 h-4" />, label: "Garage" },
    { icon: <Flame className="w-4 h-4" />, label: "Fireplace" },
    { icon: <Wrench className="w-4 h-4" />, label: "Recently Renovated" },
    { icon: <Star className="w-4 h-4" />, label: "Premium Features" },
  ];

  return (
    <section className="bg-secondary py-8" id="trends">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          House Price Prediction Insights
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {insights.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 shadow-xs text-sm font-medium text-foreground"
            >
              <span className="text-primary">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Comps Section ----
interface CompsSectionProps {
  comps: ComparableProperty[];
}
function CompsSection({ comps }: CompsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card border-0 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Local Comparable Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comps.slice(0, 5).map((comp, i) => (
              <div
                key={comp.address}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                data-ocid={`comps.item.${i + 1}`}
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {comp.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {comp.bedrooms}bd · {comp.bathrooms}ba ·{" "}
                    {comp.size.toLocaleString()} sqft
                  </p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {formatPrice(comp.price)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label="Favorite"
                  data-ocid={`comps.toggle.${i + 1}`}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Neighborhood Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary rounded-xl h-48 flex flex-col items-center justify-center gap-3 border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  Map View
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Interactive map coming soon
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Walk Score", value: "82" },
                { label: "Schools", value: "A+" },
                { label: "Transit", value: "74" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center bg-muted rounded-lg p-2"
                >
                  <p className="text-base font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Key Value Drivers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                icon: <Square className="w-4 h-4" />,
                label: "Size & Layout",
                impact: "High",
                color: "text-success",
              },
              {
                icon: <MapPin className="w-4 h-4" />,
                label: "Location & Zip Code",
                impact: "High",
                color: "text-success",
              },
              {
                icon: <Wrench className="w-4 h-4" />,
                label: "Recent Renovations",
                impact: "Medium",
                color: "text-yellow-600",
              },
              {
                icon: <BedDouble className="w-4 h-4" />,
                label: "Bedrooms & Baths",
                impact: "Medium",
                color: "text-yellow-600",
              },
              {
                icon: <Car className="w-4 h-4" />,
                label: "Garage & Amenities",
                impact: "Low",
                color: "text-muted-foreground",
              },
              {
                icon: <Calendar className="w-4 h-4" />,
                label: "Year Built",
                impact: "Low",
                color: "text-muted-foreground",
              },
            ].map((driver) => (
              <div
                key={driver.label}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-primary">{driver.icon}</span>
                <span className="flex-1 text-sm">{driver.label}</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${driver.color} border-current`}
                >
                  {driver.impact}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ---- Three-Column Feature Section ----
function ThreeColumnSection() {
  return (
    <section className="bg-white py-16" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">
            Why EstimateHome.ai
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Smarter Property Decisions
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Our AI analyzes thousands of market signals to give you the most
            accurate estimate available.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <BarChart2 className="w-6 h-6" />,
              title: "Real-Time Market Data",
              desc: "Live pricing data from thousands of recent sales in your area, updated daily.",
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: "AI Accuracy Engine",
              desc: "Our model achieves 94%+ confidence in most markets, beating traditional appraisals.",
            },
            {
              icon: <Home className="w-6 h-6" />,
              title: "Comparable Properties",
              desc: "See nearby sold homes to understand how your property stacks up in the market.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-card border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Footer ----
function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  const cols = [
    {
      title: "Navigation",
      links: ["Home", "Prediction", "Market Trends", "About"],
    },
    {
      title: "Resources",
      links: ["How It Works", "Accuracy Report", "API Docs", "Blog"],
    },
    {
      title: "Contact Info",
      links: ["hello@estimatehome.ai", "1-800-ESTIMATE", "San Francisco, CA"],
    },
    {
      title: "Social Media",
      links: ["Twitter / X", "LinkedIn", "Facebook", "Instagram"],
    },
  ];

  return (
    <footer className="bg-white border-t border-border pt-12 pb-6" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                EstimateHome<span className="text-primary">.ai</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered home valuations you can trust. Instant, accurate, free.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <Separator className="mb-5" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            &copy; {year}. Built with &hearts; using{" "}
            <a
              href={utm}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---- App ----
export default function App() {
  return (
    <div className="min-h-screen bg-background" id="top">
      <Navbar />
      <main>
        <HeroSection />
        <InsightsStrip />
        <ThreeColumnSection />
      </main>
      <Footer />
    </div>
  );
}
