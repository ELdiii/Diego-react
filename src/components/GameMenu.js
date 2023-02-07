import { BiHome, BiFullscreen, BiUser, BiLogOut } from "react-icons/bi";

export default function GameMenu() {
  return (
    <ul className=" flex items-center justify-around w-full mx-auto max-w-xs bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl p-3 border-main_light_blue border-4 mb-5 absolute bottom-2 left-1/2 -translate-x-1/2">
      <li>
        <BiHome className="text-4xl" />
      </li>
      <li>
        <BiFullscreen className="text-4xl" />
      </li>
      <li>
        <BiUser className="text-4xl" />
      </li>
      <li>
        <BiLogOut className="text-4xl" />
      </li>
    </ul>
  );
}
