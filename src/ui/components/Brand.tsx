interface BrandProps {
  compactOnMobile?: boolean;
}

export function Brand({ compactOnMobile = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3 text-content">
      <img alt="" className="size-9 rounded-lg" src="/brand-mark.png" />
      <span className={`text-lg font-semibold ${compactOnMobile ? 'sr-only sm:not-sr-only' : ''}`}>
        Ponto em Ponto
      </span>
    </div>
  );
}
