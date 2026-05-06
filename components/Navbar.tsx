const navItems = ["Dashboard", "Leads", "Conversations"];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <a
          className="font-heading text-base font-bold tracking-tight text-text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/40"
          href="/"
        >
          RelayDesk
        </a>

        <nav aria-label="Primary navigation" className="hidden sm:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  className="text-sm text-text-secondary transition duration-200 hover:text-text-primary focus:outline-none focus:ring-[3px] focus:ring-primary/40"
                  href={item === "Dashboard" ? "/" : `#${item.toLowerCase()}`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface font-heading text-sm font-bold text-text-primary transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-[3px] focus:ring-primary/40"
          type="button"
        >
          AR
        </button>
      </div>
    </header>
  );
}
