import pfp from "../assets/Diego_mugshot.png";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProfileMenu({ isOpen, allObjectives, currentObjective }) {
  const [isOpenState, setIsOpenState] = useState(isOpen);
  const [items, setItems] = useState([]);
  
  const missions = require("../assets/markers.json");


  useEffect(() => {

    setItems([]);

    const index = allObjectives.indexOf(currentObjective);
    console.log(index)
    const arrP = []
    for (let i = 1; i < index;i++) {
      if (i < index) {
        let currentItem = missions[allObjectives[i]].item
        arrP.push(currentItem)
      }
    }
    setItems(arrP)
  }, [currentObjective, isOpen]);

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
          <div className="text-sm">{`Úloha: ${items.length+1}`}</div>
        </div>
      </div>
      <div className="mt-6 flex w-full items-center justify-center gap-4">
        <div className="flex flex-col">
          <span className="text-lg text-red-500">Pozbierané predmety:</span>
          <div className="flex flex-col">
            {items.map((item, i)=> {
              return <span key={i} className="text-sm text-white">{item}</span>
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
