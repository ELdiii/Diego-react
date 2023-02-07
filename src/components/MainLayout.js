import GameMenu from "./GameMenu";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { motion } from "framer-motion";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_GL_KEY;

export default function MainLayout() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const turfOptions = { units: "meters" };

  //state for map variables
  const [lng, setLng] = useState(18.853731);
  const [lat, setLat] = useState(48.587415);
  const [zoom, setZoom] = useState(16);

  //game related state
  const [currentObjective, setCurrentObjective] = useState(0);
  const [nextObjective, setNextObjective] = useState(1);
  const [distance, setDistance] = useState(0);
  const [isNearObjective, setIsNearObjective] = useState(false);

  //markers json
  const missions = require("../assets/markers.json");

  //initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
  });

  //register geolocate control
  useEffect(() => {
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: false,
      }).on("geolocate", function (e) {
        setLng(e.coords.longitude.toFixed(4));
        setLat(e.coords.latitude.toFixed(4));
      })
    );
  });

  //marker for the current objective
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    const marker = new mapboxgl.Marker()
      .setLngLat([
        missions[currentObjective].lon,
        missions[currentObjective].lat,
      ])
      .addTo(map.current);
    //remove last marker on re-render
    return () => marker.remove();
  }, [currentObjective, missions]);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setZoom(map.current.getZoom().toFixed(2));

      let line = turf.lineString([
        [lng, lat],
        [missions[currentObjective].lon, missions[currentObjective].lat],
      ]);
      setDistance(turf.length(line, turfOptions).toFixed(0));

      if (distance < 20) {
        // player is near the objective
        setIsNearObjective(true);
      } else {
        setIsNearObjective(false);
      }
    });
  });

  //handler for button confirming the objective was delivered
  function deliveryButtonHandler() {
    setCurrentObjective(0);
    console.log(currentObjective);
  }

  //handler for button confirming the next objective has been picked up
  function nextObjectiveHandler() {
    setCurrentObjective(nextObjective);
    setNextObjective(nextObjective + 1);
  }

  return (
    <>
      <div className="sm:grid sm:h-screen sm:place-content-center sm:bg-stone-600 w-screen ">
        <div className="grid h-screen max-w-screen-sm grid-rows-[1fr_auto] bg-main_dark_blue sm:max-h-[800px] sm:w-[450px] relative">
          <div
            ref={mapContainer}
            className="m-4 border-solid border-4 border-main_light_blue rounded-3xl z-0 relative mb-[3.6rem]"
          >
            {isNearObjective && (
              <motion.button
                initial={{ y: 50, x: "-50%" }}
                animate={{ y: [30, 15, 30] }}
                transition={{ duration: 2, repeat: Infinity }}  
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 bg-main_dark_blue text-white pb-8 px-8 pt-2 font-black rounded-xl border-solid border-4 border-main_light_blue will-change-transform"
                onClick={deliveryButtonHandler}
              >
                Confirm
              </motion.button>
            )}
            <div className="absolute z-10 top-4 left-2 text-xs bg-main_dark_blue text-white p-2 px-3 font-bold rounded-xl border-solid border-4 border-main_light_blue">
              {`Current Objective: ${missions[currentObjective].name} (${distance} m)`}
            </div>
          </div>
          <GameMenu />
        </div>
      </div>
    </>
  );
}
