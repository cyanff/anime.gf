interface Props {
  avatar: string | null;
  name: string;
}

function Card({ avatar, name }: Props) {
  return (
    <div className="flex h-60 min-w-max w-40 flex-col items-center justify-top p-6 rounded-xl bg-neutral-700 m-4">
      <img className="h-32 w-32 rounded-xl object-cover" src={avatar || "default_avatar.png"} />
      <div className="text-center text-sm text-neutral-200">{name}</div>
    </div>
  );
}

export default Card;
