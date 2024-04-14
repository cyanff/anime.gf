interface Props {
  avatar: string | null;
  name: string;
  onClick: () => void;
}

function Card({ avatar, name, onClick }: Props) {
  return (
    <div
      className="w-30 justify-top m-4 flex h-52 min-w-max flex-col items-center rounded-xl bg-neutral-700 p-4"
      onClick={onClick}
    >
      <img className="h-32 w-32 rounded-xl object-cover" src={avatar || "default_avatar.png"} />
      <div className="pt-2 text-center font-semibold text-neutral-200">{name}</div>
    </div>
  );
}

export default Card;
