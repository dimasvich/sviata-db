import dayjs from 'dayjs';
import Typography from '../Typography';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SviatoCard({
  name,
  date,
  id,
  teaser,
  img,
}: {
  name: string;
  date: string;
  id: string;
  teaser?: string;
  img?: string;
}) {
  const router = useRouter();
  const formattedDate = dayjs(date).format('DD MMM YYYY');

  return (
    <div
      onClick={() => router.push(`/add-info?id=${id}`)}
      className="cursor-pointer flex flex-col w-full p-4 bg-surface border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      {img ? <Image src={img} alt={name} /> : ''}

      <div className="flex justify-between items-start sm:items-center mb-1">
        <Typography type="title">{name}</Typography>
        <Typography type="text" className="text-secondary ml-4">
          {formattedDate}
        </Typography>
      </div>

      {/* Teaser під назвою */}
      {teaser && (
        <div className="max-w-[400px]">
          <Typography
            type="text"
            className="text-secondary text-sm sm:text-base whitespace-pre-line break-words"
          >
            {teaser}
          </Typography>
        </div>
      )}
    </div>
  );
}
