import pfp from "../assets/Diego_mugshot.png";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProfileMenu({ isOpen, currentObjective }) {
  const [isOpenState, setIsOpenState] = useState(isOpen);

  useEffect(() => {
    setIsOpenState(isOpen);
  }, [isOpen]);

  return (
    <motion.div
      className="absolute bottom-2 left-1/2 z-30 flex h-80 w-60  flex-col items-start overflow-hidden rounded-3xl border-2 border-main_light_blue bg-main_dark_blue text-white"
      initial={{ y: 350, x: "-50%" }}
      animate={{ y: isOpenState ? 0 : 350, x: "-50%" }}
      exit={{ y: 350, x: "-50%" }}
    >
      {/* profile picture and name  */}
      <div className="mt-6 flex w-full items-center justify-center gap-4">
        <img
          alt="diego pfp"
          src={pfp}
          className="w-16 rounded-full border-2 border-main_light_blue bg-white"
        ></img>
        <div>
          <div className="text-bold text-2xl">Diego</div>
          <div className="text-sm">Level: 1</div>
        </div>
      </div>
      <div className="mx-auto pt-6 text-sm">Distance walked: 1.2 km</div>
      <div className="mx-auto max-w-[160px] pt-6"><span className="text-red-500">Current objective:</span> {currentObjective.about}</div>
    </motion.div>
  );
}
