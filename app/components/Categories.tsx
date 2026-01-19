import Image from "next/image";
const Categories =() =>{
    return(
        <div className="cursor-pointer pb-6 flex items-center space-x-11">
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100 z-1">
                <Image
                src="/Top_City_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold whitespace-nowrap">Top Cities</span>
            </div>
            <div className="pb-3 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Amazing_views_icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-bold whitespace-nowrap ">Amazing Views</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Top_Of_The_World_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold whitespace-nowrap">Top Of The World</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Artic_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={25}
                />
                <span className="text-xs font-semibold whitespace-nowrap">Artics</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Rooms_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold whitespace-nowrap">Rooms</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Mansion_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold whitespace-nowrap">Mansions</span>
            </div>
          
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Trending_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold whitespace-nowrap">Trending</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/BeachFront_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold">BeachFront</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Camping_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold">Camping</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Farms_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold">Farms</span>
            </div>
            <div className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-gray-500 hover:border-black opacity-50 hover:opacity-100">
                <Image
                src="/Domes_Icon.jpg"
                alt="TopCity-icon"
                width={20}
                height={20}
                />
                <span className="text-xs font-semibold ">Domes</span>
            </div>
            <div className=" flex items-center space-x-2 p-1 m-[-35px] w-[95px] border rounded-full border-gray-300 hover:border-black hover:bg-gray-200 transition">
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
    <span className="text-black  font-semibold">Filters</span>
    </div>

            
        </div>
    )
}
export default Categories;