export function SparkAccent({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className={className}><path d="m8 17-4-5m12 2 1-9m6 14 6-5" /></svg>;
}
export function StatusIcon({ warning = false }: { warning?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="9" />{warning ? <path d="M12 7v6m0 3h.01" /> : <path d="m8 12 3 3 5-6" />}</svg>;
}
