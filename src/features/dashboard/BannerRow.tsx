import { dashboardData } from "@/data";
import { Icon } from "@/components/ui/Icon";

/** Four period sales banners (canvas `v.hBanners`). Colours are the fixture's design tokens. */
export function BannerRow() {
  const { banners } = dashboardData();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--grid-kpi-min),1fr))] gap-4">
      {banners.map(([label, value, bg, icon]) => (
        <div key={label} className="flex items-center gap-3 rounded-md p-4 text-white" style={{ background: bg }}>
          <span className="grid size-9 flex-none place-items-center rounded-md bg-white/20">
            <Icon name={icon} size={18} />
          </span>
          <span className="min-w-0">
            <span className="type-eyebrow block">{label}</span>
            <span className="type-title u-num block">{value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
