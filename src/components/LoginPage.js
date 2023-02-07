import React from "react";
import logo from "../assets/logo.png";
import vlnky from "../assets/vlnky.svg";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage({ logInFunc }) {
  return (
    <div className="sm:grid sm:h-screen sm:place-content-center sm:bg-stone-600 w-screen ">
      <div className="h-screen max-w-screen-sm grid-rows-[1fr_auto] bg-main_dark_blue sm:max-h-[800px] sm:w-[450px] flex flex-col">
        <div className="font-['Blankeny'] text-6xl font-bold text-main_yellow drop-shadow-[3px_2px_0px_rgba(33,158,188,1)] mt-6 h-fit mx-auto">
          Diego's Journey
        </div>
        <img alt="" src={logo} className="h-fit w-1/2 mx-auto mt-12"></img>
        <div className=" text-white text-4xl mx-auto mt-24 ">Login with</div>
        <div className="flex mx-auto gap-6 mt-12">
          <AiFillGithub className="text-white text-6xl hover:cursor-pointer" onClick={logInFunc}/>
          <FcGoogle className="text-6xl" />
        </div>
        <img alt="" src={vlnky} className="mt-auto"></img>
      </div>
    </div>
  );
}
