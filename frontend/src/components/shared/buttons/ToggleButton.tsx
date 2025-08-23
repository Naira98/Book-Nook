export default function ToggleButton({
    onClick,
    checked
}:{
    onClick: () => void;
    checked: boolean;
}) {

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input onChange={onClick} checked={checked} type="checkbox" className="sr-only peer" />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none  rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400 "></div>
    </label>
  );
}

