import { AiFillHome } from "react-icons/ai";

export default function GameMenu() {
  return (
    <ul className=" flex items-center justify-around w-full mx-auto max-w-xs bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl p-3 border-slate-800 border-4 mb-5">
      <li>
        <AiFillHome className="text-4xl" />
      </li>
      <li>
        <AiFillHome className="text-4xl" />
      </li>
      <li>
        <AiFillHome className="text-4xl" />
      </li>
      <li>
        <AiFillHome className="text-4xl" />
      </li>
    </ul>
  );
}
