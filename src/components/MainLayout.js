import GameMenu from "./GameMenu";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_GL_KEY;

export default function MainLayout() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const turfOptions = { units: "meters" };

  const [lng, setLng] = useState(18.8496);
  const [lat, setLat] = useState(48.5918);
  const [zoom, setZoom] = useState(15);

  const [currentObjective, setCurrentObjective] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isNearObjective, setIsNearObjective] = useState(false);

  const missions = require("../assets/markers.json");

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
        showAccuracyCircle: false,
      }).on("geolocate", function (e) {
        setLng(e.coords.longitude.toFixed(4));
        setLat(e.coords.latitude.toFixed(4));
      })
    );
  });

  useEffect(() => {
    const marker = missions[currentObjective];
    new mapboxgl.Marker()
      .setLngLat([marker.lon, marker.lat])
      .addTo(map.current);
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
      if (distance < 0.03) {
        // player is near the objective
        //TODO: add a popup with a button to confirm the objective
        setIsNearObjective(true);
      }
    });
  });

  return (
    <>
      <div className="sm:grid sm:h-screen sm:place-content-center sm:bg-stone-600 w-screen ">
        <div className="grid h-screen max-w-screen-sm grid-rows-[1fr_auto] bg-main_dark_blue sm:max-h-[800px] sm:w-[450px] relative">
          <div
            ref={mapContainer}
            className="m-4 border-solid border-4 border-main_light_blue rounded-3xl z-0 relative mb-[3.6rem]"
          >
            {
              <button className="absolute bottom-10 left-2 z-10 bg-main_dark_blue text-white p-2 px-3 font-bold rounded-xl border-solid border-4 border-main_light_blue">
                Confirm
              </button>
            }
            <div className="absolute z-10 top-4 left-2 text-sm bg-main_dark_blue text-white p-2 px-3 font-bold rounded-xl border-solid border-4 border-main_light_blue">
              {`Current Objective: ${missions[currentObjective].name} (${distance} m)`}
            </div>
          </div>
          <GameMenu />
        </div>
      </div>
    </>
  );
}
