export default function Carousel({ children }: { children: React.ReactNode }) {
  return <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">{children}</div>;
}
