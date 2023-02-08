import { BiHome, BiFullscreen, BiUser, BiLogOut } from "react-icons/bi";

export default function GameMenu({ handleIsProfileMenuOpen }) {
  return (
    <ul className=" absolute bottom-2 left-1/2 mx-auto mb-5 flex w-full max-w-xs -translate-x-1/2 items-center justify-around rounded-3xl border-4 border-main_light_blue bg-gradient-to-r from-orange-400 to-yellow-400 p-3">
      <li>
        <BiHome className="text-4xl" />
      </li>
      <li>
        <BiFullscreen className="text-4xl" />
      </li>
      <li>
        <BiUser
          className="text-4xl hover:cursor-pointer"
          onClick={() => {
            handleIsProfileMenuOpen();
          }}
        />
      </li>
      <li>
        <BiLogOut className="text-4xl" />
      </li>
    </ul>
  );
}
