"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full space-y-12 text-center">
        {/* Hero Section */}
        <section className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Hello, Character.AI Team!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            I&apos;m Nelson, a frontend engineer passionate about AI and
            performance optimization. This project demonstrates how better
            observability can improve AI chat interactions.
          </p>
        </section>

        {/* CTA Button */}
        <section>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     text-lg font-semibold transition-colors duration-200 
                     shadow-lg hover:shadow-xl"
          >
            Try the Dashboard
          </button>
        </section>

        {/* Quick Insight Section */}
        <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
          <p className="text-xl text-gray-700 dark:text-gray-200 font-medium max-w-2xl mx-auto">
            Character.AI handles millions of interactions daily—this project
            helps optimize AI performance by improving logging, debugging, and
            response time analysis.
          </p>
        </section>
      </div>
    </main>
  );
}
