type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

const BrandMark = ({ compact = false, className = "" }: BrandMarkProps) => {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl">
        <img
          src="/LOGO.ico"
          alt="Logo FERREMAS"
          className="h-11 w-11 object-contain"
        />
      </span>

      {!compact && (
        <span className="leading-none">
          <span className="block text-[0.68rem] font-black uppercase tracking-[0.34em] text-primary">
            Ferreteria
          </span>
          <span className="mt-0.5 block text-[1.75rem] font-black tracking-[-0.04em] text-foreground">
            FERRE<span className="text-primary">MAS</span>
          </span>
        </span>
      )}
    </span>
  );
};

export default BrandMark;
