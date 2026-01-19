"use client";

import Modals from "./Modals";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UseSignUpModal from "@/app/Hooks/UseSignUpModal";
import CustomButton from "../Forms/CustomButton";
import { toast } from 'react-toastify';

const SignUpModal = () => {
    const router = useRouter();
    const SignUpModal = UseSignUpModal();
    const { isLoaded, signUp } = useSignUp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submitSignup = async () => {
        if (!isLoaded) return;

        try {
            setIsLoading(true);

            if (password !== confirmPassword) {
                toast.error("Passwords don't match");
                return;
            }

            // Start the sign up process with Clerk
            const result = await signUp.create({
                emailAddress: email,
                password: password,
            });

            // Check if sign up was successful
            if (result.status === "complete") {
                // Sign up successful
                toast.success("Account created successfully!");
                SignUpModal.close();
                router.push('/');
            } else {
                // Handle verification if needed
                const firstFactor = result.supportedFirstFactors[0];
                if (firstFactor.strategy === "email_code" && firstFactor.emailAddressId) {
                    // Prepare verification
                    await signUp.prepareFirstFactor({
                        strategy: "email_code",
                        emailAddressId: firstFactor.emailAddressId
                    });
                    toast.info("Please check your email for verification code");
                }
            }
        } catch (err: any) {
            console.error("Error during sign up:", err);
            toast.error(err.errors?.[0]?.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    const Content = (
        <>
            <h2 className="mb-6 text-2xl">Welcome To FlexBnB, Please Sign-Up</h2>

            <div className="space-y-4">
                <input 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email Address"
                    type="email"
                    disabled={isLoading}
                    className="mb-4 px-4 w-full h-[54px] border border-gray-300 rounded-xl"
                />

                <input 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your Password"
                    type="password"
                    disabled={isLoading}
                    className="mb-4 px-4 w-full h-[54px] border border-gray-300 rounded-xl"
                />

                <input 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    type="password"
                    disabled={isLoading}
                    className="mb-4 px-4 w-full h-[54px] border border-gray-300 rounded-xl"
                />
                
                <CustomButton
                    label={isLoading ? "Creating Account..." : "Sign-Up"}
                    onClick={submitSignup}
                    disabled={isLoading || !email || !password || !confirmPassword}
                />
            </div>
        </>
    );

    return (
        <Modals
            isOpen={SignUpModal.isOpen}
            close={SignUpModal.close}
            label="Sign-Up"
            Content={Content}
        />
    );
};

export default SignUpModal;