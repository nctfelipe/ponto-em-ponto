export function AdminSidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white px-6 py-4 md:min-h-full md:w-64 md:border-r md:border-b-0">
      <nav aria-label="Administração">
        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Administração
        </p>
        <span
          aria-current="page"
          className="block rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
        >
          Usuários
        </span>
      </nav>
    </aside>
  );
}
