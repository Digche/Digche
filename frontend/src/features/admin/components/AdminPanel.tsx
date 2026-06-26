type AdminPanelProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function AdminPanel({
  children,
  className = "",
  contentClassName = "",
}: AdminPanelProps) {
  return (
    <section
      className={`min-h-[calc(100vh-88px)] overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm md:h-[calc(100vh-48px)] md:min-h-0 ${className}`}
    >
      <div className={`h-full ${contentClassName}`}>{children}</div>
    </section>
  );
}