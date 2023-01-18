import GameMenu from "./GameMenu";

export default function MainLayout() {
  return (
    <>
      <div className="sm:grid sm:h-screen sm:place-content-center sm:bg-stone-600 w-screen ">
        <div className="grid h-screen max-w-screen-sm grid-rows-[1fr_auto] bg-red-200 sm:max-h-[800px] sm:w-[450px] ">
            <div>Game</div>
            <GameMenu />
        </div>
      </div>
    </>
  );
}
