'use client'

interface MenuLinkProps{
    label:string;
    onClick: ()=> void;
    icon?: React.ReactNode;
}



const MenuLink: React.FC<MenuLinkProps> =({
    label,
    onClick,
    icon
}) =>{
    return(
        <div onClick={onClick}
         className="px-5 py-4 overflow-visible flex items-center space-x-2 cursor-pointer hover:bg-gray-100 transition">
            {icon && <span className="text-gray-500">{icon}</span>}
            <span>{label}</span>
        </div>
    )
}
export default MenuLink;