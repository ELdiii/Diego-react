import pfp from "../assets/Diego_mugshot.png";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/helper/supabaseClient";

export function ProfileMenu({ isOpen, allObjectives }) {
  const [isOpenState, setIsOpenState] = useState(isOpen);
  let pickedMissions = useRef([]);
  let items = useRef([]);
  const missions = require("../assets/markers.json");

  useEffect(() => {
    setIsOpenState(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      const currentMissionIndex = await getCurrentMission();
      pickedMissions.current = allObjectives;
      items.current = [];
      for (let i = 1; i <= currentMissionIndex - 1; i++) {
        items.current.push(missions[pickedMissions.current[i]].item);
      }
    };

    fetchData();
  }, [allObjectives, missions]);

  async function getCurrentMission() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const result = await supabase
      .from("main_data")
      .select("current_mission")
      .eq("player_id", user.id);
    return result.data[0].current_mission;
  }

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
          <div className="text-sm">{`Úloha: ${items.current.length + 1}`}</div>
        </div>
      </div>
      <div className="mt-6 flex w-full items-center justify-center gap-4">
        <div className="flex flex-col">
          <span className="text-lg text-red-500">Pozbierané predmety:</span>
          <div className="flex flex-col">
            {items.current.map((item) => {
              return <span>{item}</span>;
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
