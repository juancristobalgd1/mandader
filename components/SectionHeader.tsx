import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function SectionHeader({ eyebrow, title, href, more = "Ver todo" }: { eyebrow?: string; title: string; href?: string; more?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="h-section mt-1 !text-[22px] md:!text-3xl">{title}</h2></div>
      {href && <Link href={href} className="flex shrink-0 items-center gap-1 text-sm text-soft hover:text-white">{more} <ArrowRight size={14} /></Link>}
    </div>
  );
}
