interface Props {
  title: string;
  onClick: () => void;
}

export const SleekButton = ({ title, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer border border-neutral-100 text-neutral-800 text-sm"
    >
      {title}
    </button>
  );
};
