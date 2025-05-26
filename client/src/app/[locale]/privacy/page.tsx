"use client";

import { useTranslations } from "next-intl";
import React from "react";

export default function PrivacyPage() {
    const t = useTranslations("Privacy");

    return (
        <main className="flex flex-col text-center mt-[80px] p-9 gap-8 items-center md:items-stretch">
            <h1 className="text-4xl font-bold">
                {t("title")}
            </h1>
            <hr className="border-t border-black" />

            {/* Sección 1: Introducción */}
            <div className="text-left">
                <h2 className="text-2xl font-bold mb-3">1. {t("introduction")}</h2>
                <p className="text-lg mb-9">{t("introductionText")}</p>
            {/* Sección 2: Información que recogemos */}
                <h2 className="text-2xl font-bold mb-3">2. {t("collect")}</h2>
                <p className="text-lg mb-9">{t("collectText")}</p>
            {/* Sección 3: Uso de la Información */}
                <h2 className="text-2xl font-bold mb-3">3. {t("information")}</h2>
                <p className="text-lg mb-2.5">{t("informationText")}</p>
                <ul className="list-disc pl-6 space-y-2 mb-9">
                    <li>{t("informationText1")}</li>
                    <li>{t("informationText2")}</li>
                    <li>{t("informationText3")}</li>
                    <li>{t("informationText4")}</li>
                    <li>{t("informationText5")}</li>
                </ul>
            {/* Sección 4: Compartir Información */}
                <h2 className="text-2xl font-bold mb-3">4. {t("share")}</h2>
                <p className="text-lg mb-2.5">{t("shareText")}</p>
                <ul className="list-disc pl-6 space-y-2 mb-9">
                    <li>{t("shareText1")}</li>
                    <li>{t("shareText2")}</li>
                    <li>{t("shareText3")}</li>
                </ul>
            {/* Sección 5: Seguridad de la Información */}
                <h2 className="text-2xl font-bold mb-3">5. {t("secure")}</h2>
                <p className="text-lg mb-9">{t("secureText")}</p>
            {/* Sección 6: Cambios a la Política de Privacidad */}
                <h2 className="text-2xl font-bold mb-3">6. {t("change")}</h2>
                <p className="text-lg mb-9">{t("changeText")}</p>
            </div>
        </main>
    );
}
