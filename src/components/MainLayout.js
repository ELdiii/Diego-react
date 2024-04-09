import GameMenu from "./GameMenu";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { motion } from "framer-motion";
import { ProfileMenu } from "./ProfileMenu";
import npc from "../assets/dzedo.png";
import doctor from "../assets/vendelin.png";

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

  const [currectSentence, setCurrentSentence] = useState("<Stlač obrazovku pre spustenie dialógu>");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  //creating data for user in database
  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser();

      if (user) {
        const { data, error } = await supabase.from("main_data").select("*").eq("player_id", user.id);

        if (error) {
          console.log(error);
          return;
        }

        // this will only run if the user doesnt have a record in the main database
        if (data.length === 0) {
          const generatedmissions = generateMissions();
          await supabase.from("main_data").insert([
            {
              player_id: user.id,
              picked_missions: generatedmissions,
              current_mission: 0,
              e_mail: user.email,
            },
          ]);
          setPickedMissions(generatedmissions);
          setCurrentObjective(0);
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
      .setLngLat([missions[currentObjective].lon, missions[currentObjective].lat])
      .addTo(map.current);
    //remove last marker on re-render
    return () => {
      marker.remove();
    };
  }, [currentObjective, missions]);

  useEffect(() => {
    if (!map.current) return;
    new mapboxgl.Marker({
      color: "#f1f1f1",
      scale: 0.8,
      anchor: "bottom",
      rotation: 22.5,
    })
      .setLngLat([18.842, 48.59])
      .addTo(map.current);
  }, []);

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
      return;
    }
  }, [currentObjective]);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

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
  //výpočet vzdialenosti medzi hráčom a bodom kam sa má dostať
  function calculateDistance() {
    let line = turf.lineString([
      [lng, lat],
      [missions[currentObjective].lon, missions[currentObjective].lat],
    ]);
    setDistance(turf.length(line, turfOptions).toFixed(0));

    //ak sa hráč nachádza pri predmete v okruhu 20m
    //zobrazí sa dialog a možnosť predmet vziať
    if (turf.length(line, turfOptions).toFixed(0) < 70) {
      setIsNearMission(true);
      return;
    }
    setIsNearMission(false);
  }

  async function handleDialogueClick() {
    if (currentSentenceIndex < missions[currentObjective].dialogues.length) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setCurrentSentence(missions[currentObjective].dialogues[currentSentenceIndex]);
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
    const result = await supabase.from("main_data").select("current_mission").eq("player_id", user.id);
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
    map.current.flyTo({ center: [18.842, 48.59], zoom: 14 });
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
            className="relative z-0 m-4 mb-[3.6rem] rounded-3xl border-4 border-solid border-main_light_blue">
            {isDialogOpen && (
              <div className="absolute left-0 bottom-0 z-20 text-white">
                <img
                  alt="pic"
                  src={currentObjective === 9 ? doctor : npc}
                  className=""
                  onClick={handleDialogueClick}></img>
                <div className="absolute left-[37%] right-[7%] top-[5%] z-30 text-black">
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
                onClick={deliveryButtonHandler}>
                {currentObjective === 9 ? "Odovzdať predmety" : "Vyzdvihnúť predmet"}
              </motion.button>
            )}
            <ProfileMenu isOpen={isProfileMenuOpen} allObjectives={pickedMissions} />
            <div className="absolute top-4 left-2 z-10 max-w-[16rem] rounded-xl border-4 border-solid border-main_light_blue bg-main_dark_blue p-2 px-3 text-xs font-bold text-white">
              {`Ďalší predmet: ${missions[currentObjective].name} (${distance} m)`}
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
