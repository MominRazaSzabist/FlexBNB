const Searchfilters = () => {
  return (
    <div className="h-[64px] flex flex-row items-center justify-between border border-white rounded-full">
      <div className="hidden lg:block">
        <div className="flex flex-row items-center justify-between">
          <div className="cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-gray-100 group">
            <p className="text-xs font-semibold text-white group-hover:text-black ">where?</p>
            <p className="text-sm text-white group-hover:text-black">Search Destinations</p>
          </div>

          <div className="cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-gray-100 group">
            <p className="text-xs font-semibold text-white group-hover:text-black ">Check In</p>
            <p className="text-sm text-white group-hover:text-black">Add Dates</p>
          </div>

          <div className="cursor-pointer h-[64px] px-8 flex justify-center   flex-col rounded-full hover:bg-gray-100 group">
            <p className="text-xs font-semibold text-white group-hover:text-black ">Check Out</p>
            <p className="text-sm text-white group-hover:text-black">Add Dates</p>
          </div>
          <div className=" cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-gray-100 group">
            <p className="text-xs font-semibold text-white group-hover:text-black ">Who</p>
            <p className="text-sm text-white group-hover:text-black">Add Guests</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        <div className="cursor-pointer p-2 lg:p-4 bg-red-500 hover:bg-red-900 transition rounded-full text-white">
        <svg  viewBox="0 0 32 32" style={{display:"block",fill:"none",height:"16px",width:"16px",stroke:"currentColor",strokeWidth:4,overflow:"visible"}} aria-hidden="true" role="presentation" focusable="false">
          <path fill="none" d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9">
             </path>
          </svg>
        </div>

      </div>
    </div>
  );
};
export default Searchfilters;
