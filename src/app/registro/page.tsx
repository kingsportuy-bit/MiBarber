import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function RegistroPage() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <OnboardingWizard />
                </div>
            </div>
        </div>
    );
}
