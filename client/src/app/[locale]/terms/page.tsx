"use client";

import { useTranslations } from "next-intl";
import React from "react";

export default function TermsConditionsPage() {
    const t = useTranslations("TermsConditions");

    return (
        <main className="flex flex-col text-center mt-[80px] p-9 gap-8 items-center md:items-stretch">
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <hr className="border-t border-black" />

            {/* Sección 1: Introducción */}
            <div className="text-left">
                <h2 className="text-2xl font-bold mb-3">1. {t("introduction")}</h2>
                <p className="text-lg mb-9">{t("introductionText")}</p>
                
                {/* Sección 2: Aceptación de Términos */}
                <h2 className="text-2xl font-bold mb-3">2. {t("acceptance")}</h2>
                <p className="text-lg mb-9">{t("acceptanceText")}</p>

                {/* Sección 3: Uso de Servicios */}
                <h2 className="text-2xl font-bold mb-3">3. {t("useOfServices")}</h2>
                <p className="text-lg mb-9">{t("useOfServicesText")}</p>

                {/* Sección 4: Propiedad Intelectual */}
                <h2 className="text-2xl font-bold mb-3">4. {t("intellectualProperty")}</h2>
                <p className="text-lg mb-9">{t("intellectualPropertyText")}</p>

                {/* Sección 5: Limitación de Responsabilidad */}
                <h2 className="text-2xl font-bold mb-3">5. {t("limitationOfLiability")}</h2>
                <p className="text-lg mb-9">{t("limitationOfLiabilityText")}</p>

                {/* Sección 6: Cambios en los Términos */}
                <h2 className="text-2xl font-bold mb-3">6. {t("changesToTerms")}</h2>
                <p className="text-lg mb-9">{t("changesToTermsText")}</p>

                {/* Sección 7: Ley Aplicable */}
                <h2 className="text-2xl font-bold mb-3">7. {t("governingLaw")}</h2>
                <p className="text-lg mb-9">{t("governingLawText")}</p>

                {/* Sección 8: Contacto */}
                <h2 className="text-2xl font-bold mb-3">8. {t("contact")}</h2>
                <p className="text-lg mb-9">{t("contactText")}</p>
            </div>
        </main>
    );
}