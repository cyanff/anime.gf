interface Props {
  avatar: string | null;
  name: string;
  onClick: () => void;

}

function Card({ avatar, name, onClick }: Props) {
  return (
    <div className="flex h-52 min-w-max w-30 flex-col items-center justify-top p-4 rounded-xl bg-neutral-700 m-4" onClick={onClick}>
      <img className="h-32 w-32 rounded-xl object-cover" src={avatar || "default_avatar.png"} />
      <div className="pt-2 text-center text-neutral-200 font-semibold">{name}</div>
    </div>
  );
}

export default Card;
