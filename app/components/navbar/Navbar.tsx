'use client'

import Image from 'next/image';
import Link from 'next/link';
import Searchfilterss from './Searchfilterss';
import UserNav from './UserNav';
import AddPropertyButton from './AddPropertyButton';

const Navbar = () => {
    return (
        <nav className="w-full absolute top-0 left-0 py-6 bg-black z-10">
            <div className="max-w-[1500px] mx-auto px-6">
                <div className="flex justify-between items-center">
                    <Link href="/">
                        <Image 
                            src="/flexbnb_logo_white.png"
                            alt="FLEXBNB"
                            width={120}
                            height={38}
                        />
                    </Link>
                    <div className="flex space-x-6">
                        <Searchfilterss />
                    </div>
                    <div className="flex items-center space-x-6 text-white">
                        <AddPropertyButton />
                        <UserNav />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
