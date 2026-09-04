import { CalendarDays, CreditCard, Dumbbell, LayoutDashboard, Users } from "lucide-react";

const navLink =
  "flex min-h-[42px] items-center gap-3 rounded-[9px] px-3 text-sm font-medium text-[#666a67] no-underline transition-colors hover:bg-white/55 hover:text-[#282d2c]";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-[#dedbd3] bg-[#ece9e2] px-[18px] pt-7 pb-5 md:flex">
      <a className="flex items-center gap-[11px] text-[#242928] no-underline" href="#top">
        <span className="grid size-[34px] shrink-0 -rotate-3 place-items-center rounded-[10px] bg-[#282d2c] text-white">
          <Dumbbell size={19} strokeWidth={2.2} />
        </span>
        <span className="flex flex-col leading-none">
          <strong className="text-[1.18rem] tracking-[-0.04em]">Gym</strong>
          <small className="mt-1 text-[0.62rem] font-semibold tracking-[0.13em] text-[#777a76] uppercase">studio</small>
        </span>
      </a>

      <nav className="mt-[42px] grid gap-[5px]" aria-label="Primary navigation">
        <a className={navLink} href="#overview">
          <LayoutDashboard size={18} />
          Overview
        </a>
        <a className={`${navLink} bg-white text-[#262b2a] shadow-xs [&>svg]:text-[#de6748]`} href="#top" aria-current="page">
          <CalendarDays size={18} />
          Timetable
        </a>
        <a className={navLink} href="#members">
          <Users size={18} />
          Members
        </a>
        <a className={navLink} href="#payments">
          <CreditCard size={18} />
          Payments
        </a>
      </nav>

      <div className="mt-auto flex items-center gap-[9px] border-t border-[#d7d3ca] pt-[15px]">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#d8a998] text-[0.7rem] font-bold text-[#542d22]">
          TZ
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <strong className="overflow-hidden text-[0.78rem] text-ellipsis whitespace-nowrap">Thant Zin Win</strong>
          <small className="mt-[3px] text-[0.68rem] text-[#7f827e]">Studio manager</small>
        </span>
      </div>
    </aside>
  );
}
