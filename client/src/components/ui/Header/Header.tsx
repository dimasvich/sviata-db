import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b-5 border-[#000000] ">
      <nav>
        <ul className="w-full flex list-none  gap-2 p-2">
          <li>
            <Link
              className="text-accent hover:text-accentHover"
              href="/auto-generate"
            >
              <i>Автогенерація свята</i>
            </Link>
          </li>
          <li>
            <Link
              className="text-accent hover:text-accentHover"
              href="/auto-generate-day"
            >
              <i>Автогенерація дня</i>
            </Link>
          </li>
          <li>
            <Link
              className="text-accent hover:text-accentHover"
              href="/month-images"
            >
              <i>Зображення на місяць</i>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
