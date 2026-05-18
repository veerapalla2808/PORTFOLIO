// components/ui/SkipLink.tsx
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#00f2ff] focus:text-black focus:font-bold focus:rounded-lg"
    >
      Skip to main content
    </a>
  );
}
