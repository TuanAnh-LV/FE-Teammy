import React from 'react'
import Vector from '../../assets/Vector.png';
import { useTranslation } from "../../hook/useTranslation";

const Forum = () => {
    const { t } = useTranslation();
    return (
        <div className="relative">
            <div className="absolute inset-0">
                <img
                    src={Vector}
                    alt="Vector background"
                    className="w-full object-cover"
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-28 xl:pt-40 pb-28">
                <h1 className="!font-sans !font-black text-[72px] md:text-[87px] leading-[96%] tracking-[-4%] text-[#3A3A3A] text-center">
                    {t("communityForum")}
                </h1>

                {/* Subtitle */}
                <p className="mt-5 font-semibold text-center text-[20px] md:text-[21px] leading-[28px] text-black/70">
                    {t("forumSubtitle")}
                </p>

            </div>



        </div>
    )
}

export default Forum