import React from "react";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                {/* --- Column 1: Brand Info --- */}
                <div>
                    <h2 className="text-[#0A2540] !text-[24px] !font-black !tracking-[-4%] mb-3">Teammy.</h2>
                    <p className="text-black/70 text-[15px] font-bold leading-[26px] max-w-xs">
                        The student platform for team formation, mentoring, and efficient
                        capstone delivery.
                    </p>
                </div>

                {/* --- Column 2: Features --- */}
                <div>
                    <h3 className="text-black !font-bold !text-[15px] mb-4">Features</h3>
                    <ul className="space-y-2 text-black/70 font-bold text-[15px] leading-[26px]">
                        <li className="hover:text-gray-900 transition cursor-pointer">Find Teammates</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">Choose Mentors</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">Project Management</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">Team Communication</li>
                    </ul>
                </div>

                {/* --- Column 3: Support --- */}
                <div>
                    <h3 className="text-black !font-bold !text-[15px] mb-4">Support</h3>
                    <ul className="space-y-2 text-black/70 font-bold text-[15px] leading-[26px]">
                        <li className="hover:text-gray-900 transition cursor-pointer">Help Center</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">Guides</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">FAQs</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">Contact</li>
                    </ul>
                </div>

                {/* --- Column 4: Connect --- */}
                <div>
                    <h3 className="text-black !font-bold !text-[15px] mb-4">Connect</h3>
                    <ul className="space-y-2 text-black/70 font-bold text-[15px] leading-[26px]">
                        <li className="hover:text-gray-900 transition cursor-pointer">Facebook</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">LinkedIn</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">Email</li>
                        <li className="hover:text-gray-900 transition cursor-pointer">GitHub</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
