import Typography from '../Typography';

export default function Notification({
  not,
  isError = false,
}: {
  not: string;
  isError?: boolean;
}) {
  return (
    <div
      className={`flex min-w-[200px] px-[8px] py-[4px]
     rounded-[8px] shadow-md bg-surface border-[2px] ${isError ? 'border-[#FF2C2C]' : 'border-primary'} fixed bottom-1 right-1`}
    >
      <Typography type="text">{not}</Typography>
    </div>
  );
}
