'use client'

import { useState } from "react";
import MenuLink from "./MenuLink";
import LogoutButton from "../LogoutButton";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
  UserButton
} from "@clerk/nextjs";
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const UserNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="cursor-pointer p-2 relative inline-block border border-white rounded-full shadow-md shadow-gray-300 hover:shadow-gray-500 hover:shadow-xl transition-shadow duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </button>

      {isOpen && (
        <div className="m-1 pl-1 w-[220px] absolute top-10 right-0 bg-white text-black border border-gray-300 rounded-xl shadow-md flex flex-col hover:bg-gray-100 transition z-2">
          <SignedIn>
            {/* User is logged in */}
            <div className="p-2 border-b border-gray-200">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>

            <div className="p-2 border-b border-gray-200">
              {/* Clerk Account Settings Button */}
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverCard: "w-full",
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>

            <MenuLink
              label="Messages"
              icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
              onClick={() => {
                window.location.href = "/Messages";
                setIsOpen(false);
              }}
            />
            <MenuLink
              label="Host Dashboard"
              onClick={() => {
                window.location.href = "/Host/Dashboard";
                setIsOpen(false);
              }}
            />
              <hr className="opacity-10"/>
            <LogoutButton />
          </SignedIn>
           
          <SignedOut>
            {/* User is logged out */}
            <SignInButton mode="modal">
              <MenuLink
                label="Log-In"
                onClick={() => {
                  setIsOpen(false);
                }}
              />
            </SignInButton>

            <SignUpButton mode="modal">
              <MenuLink
                label="Sign-Up"
                onClick={() => {
                  setIsOpen(false);
                }}
              />
            </SignUpButton>
          </SignedOut>
        </div>
      )}
    </div>
  );
};

export default UserNav;

