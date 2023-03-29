import GameMenu from "./GameMenu";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { motion } from "framer-motion";
import { ProfileMenu } from "./ProfileMenu";
import dzedo from "../assets/dzedo.png";

import { supabase } from "../lib/helper/supabaseClient";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_GL_KEY;

export default function MainLayout({ logOutFunc }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const turfOptions = { units: "meters" };

  //state for map variables
  const [lng, setLng] = useState(18.853731);
  const [lat, setLat] = useState(48.587415);
  const [zoom, setZoom] = useState(16);

  //game related state
  const [currentObjective, setCurrentObjective] = useState(1);
  const [pickedMissions, setPickedMissions] = useState([0, 0, 0, 0, 0]);
  const [distance, setDistance] = useState(0);
  const [isNearMission, setIsNearMission] = useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //markers json
  const missions = require("../assets/markers.json");

  const [currectSentence, setCurrentSentence] = useState(
    "<Press the screen to start dialogue>"
  );
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  useEffect(() => {
    console.log();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  //creating data for user in database
  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser();

      if (user) {
        const { data, error } = await supabase
          .from("main_data")
          .select("*")
          .eq("player_id", user.id);

        if (error) {
          console.log(error);
          return;
        }

        // this will only run if the user doesnt have a record in the main database
        if (data.length === 0) {
          await supabase.from("main_data").insert([
            {
              player_id: user.id,
              picked_missions: generateMissions(),
              current_mission: 0,
              e_mail: user.email,
            },
          ]);
          return;
        }
        // this will run if the user has a record in the main database
        const picked_missions = data[0].picked_missions;
        setPickedMissions(picked_missions);
        setCurrentObjective(picked_missions[data[0].current_mission]);
      }
    };

    fetchData();
  }, []);

  //initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/eldiii/cldx1dxbe001s01qrb6i5qeoz",
      center: [lng, lat],
      zoom: zoom, // pitch in degrees
    });
  });

  //register geolocate control
  useEffect(() => {
    let geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    }).on("geolocate", function (e) {
      setLng(e.coords.longitude.toFixed(4));
      setLat(e.coords.latitude.toFixed(4));
    });
    map.current.addControl(geolocate);
    //trigger geolocate on map load
    map.current.on("load", function () {
      geolocate.trigger();
    });
  }, []);

  //marker for the current objective
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    const marker = new mapboxgl.Marker({
      color: "#8ECAE6",
      scale: 0.8,
      anchor: "bottom",
      rotation: 22.5,
    })
      .setLngLat([
        missions[currentObjective].lon,
        missions[currentObjective].lat,
      ])
      .addTo(map.current);
    //remove last marker on re-render
    return () => {
      marker.remove();
    };
  }, [currentObjective, missions]);

  //set zoom for map
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setZoom(map.current.getZoom().toFixed(2));
      calculateDistance();
    });
  });

  //calculate distance on objective change
  useEffect(() => {
    calculateDistance();
  }, [currentObjective]);

  useEffect(() => {
    if (currentObjective === 0) {
      setIsDialogOpen(true);
    }
  }, [currentObjective]);

  //testing useeffect
  useEffect(() => {
    console.log(currentObjective);
  }, []);

  //helper function to generate array of 5 elements in random order
  function generateMissions() {
    const arr = [];
    arr.push(0);
    while (arr.length < 6) {
      const num = Math.floor(Math.random() * 8) + 1;
      if (!arr.includes(num)) {
        arr.push(num);
      }
    }
    arr.push(9);
    arr.push(10);
    return arr;
  }
  //calculate distance between player and objective
  function calculateDistance() {
    let line = turf.lineString([
      [lng, lat],
      [missions[currentObjective].lon, missions[currentObjective].lat],
    ]);
    setDistance(turf.length(line, turfOptions).toFixed(0));

    if (turf.length(line, turfOptions).toFixed(0) < 20) {
      // player is near the objective
      setIsNearMission(true);
      return;
    }
    setIsNearMission(false);
  }

  async function handleDialogueText() {
    //ked je otvoreny dialog > click behavior
    if (currentSentenceIndex < missions[currentObjective].dialogues.length) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setCurrentSentence(
        missions[currentObjective].dialogues[currentSentenceIndex]
      );
      return;
    }
    //ked skonci dialog
    setCurrentSentenceIndex(0);
    setIsDialogOpen(false);
    setCurrentObjective(pickedMissions[(await getCurrentMission()) + 1]);
    updateCurrentMission();
  }

  //handler for button confirming the objective was delivered
  function deliveryButtonHandler() {
    setIsDialogOpen(true);
  }

  function handleIsProfileMenuOpen() {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }

  //get current mission from database
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

  //update current mission in database
  async function updateCurrentMission() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentMission = await getCurrentMission();
    await supabase
      .from("main_data")
      .update({ current_mission: currentMission + 1 })
      .eq("player_id", user.id);
  }

  function flyToHomeButton() {
    map.current.flyTo({ center: [18.842, 48.59], zoom: 13 });
  }

  function flyToMarker() {
    map.current.flyTo({
      center: [missions[currentObjective].lon, missions[currentObjective].lat],
      zoom: 14,
    });
  }

  return (
    <>
      <div className="w-screen sm:grid sm:h-screen sm:place-content-center sm:bg-stone-600 ">
        <div className="relative grid h-screen max-w-screen-sm grid-rows-[1fr_auto] bg-main_dark_blue sm:max-h-[800px] sm:w-[450px]">
          <div
            ref={mapContainer}
            className="relative z-0 m-4 mb-[3.6rem] rounded-3xl border-4 border-solid border-main_light_blue"
          >
            {isDialogOpen && (
              <div className="absolute -left-2 bottom-32 z-20 h-1/2 text-white">
                <img
                  alt="pic"
                  src={dzedo}
                  className=""
                  onClick={handleDialogueText}
                ></img>
                <div className="absolute left-[7.2rem] top-6 z-30 text-black">
                  {currectSentence}
                </div>
              </div>
            )}
            {isNearMission && (
              <motion.button
                initial={{ y: 50, x: "-50%" }}
                animate={{ y: [30, 15, 30] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 rounded-xl border-4 border-solid border-main_light_blue bg-gradient-to-r from-orange-400 to-yellow-400 px-6 pb-8 pt-2 font-black text-black will-change-transform"
                onClick={deliveryButtonHandler}
              >
                Pick up the item
              </motion.button>
            )}
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              currentObjective={missions[currentObjective]}
            />
            <div className="absolute top-4 left-2 z-10 rounded-xl border-4 border-solid border-main_light_blue bg-main_dark_blue p-2 px-3 text-xs font-bold text-white">
              {`Current Objective: ${missions[currentObjective].name} (${distance} m)`}
            </div>
          </div>
          <GameMenu
            handleIsProfileMenuOpen={handleIsProfileMenuOpen}
            logOutFunc={logOutFunc}
            homeButton={flyToHomeButton}
            markerButton={flyToMarker}
          />
        </div>
      </div>
    </>
  );
}
