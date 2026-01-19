'use client';

import { useUser, SignInButton } from "@clerk/nextjs";
import UseAddPropertyModal from "@/app/Hooks/UseAddPropertyModal";

const AddPropertyButton = () => {
  const { isSignedIn } = useUser();
  const addPropertyModal = UseAddPropertyModal();

  const handleClick = () => {
    if (isSignedIn) {
      addPropertyModal.open();
    }
  };

  return (
    <>
      {isSignedIn ? (
        <div
          onClick={handleClick}
          className="cursor-pointer p-2 text-sm font-semibold rounded-full hover:bg-white hover:text-black transition-colors"
        >
          Flexbnb Your Home
        </div>
      ) : (
        <SignInButton mode="modal">
          <div
            className="cursor-pointer p-2 text-sm font-semibold rounded-full hover:bg-white hover:text-black transition-colors"
          >
            Flexbnb Your Home
          </div>
        </SignInButton>
      )}
    </>
  );
};

export default AddPropertyButton;
