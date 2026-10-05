export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  return <div className="space-y-2">{items.map((i) => <details key={i.q} className="panel group p-4"><summary className="cursor-pointer list-none font-medium text-white">{i.q}</summary><p className="mt-2 text-sm text-soft">{i.a}</p></details>)}</div>;
}
