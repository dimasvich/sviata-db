import dayjs from 'dayjs';
import Typography from '../Typography';
import { useRouter } from 'next/navigation';

export default function SviatoCard({
  name,
  date,
  id,
}: {
  name: string;
  date: string;
  id: string;
}) {
  const router = useRouter();
  const formattedDate = dayjs(date).format('DD MMM YYYY');

  return (
    <div
      onClick={() => router.push(`/edit-sviato?id=${id}`)}
      className="cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-4 bg-surface border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 mb-2 sm:mb-0">
        <Typography type="title">{name}</Typography>
      </div>

      <div className="text-secondary sm:ml-4">
        <Typography type="text">{formattedDate}</Typography>
      </div>
    </div>
  );
}
