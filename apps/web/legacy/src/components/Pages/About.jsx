import React, { useEffect, useState } from 'react';

export default function About() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time (you can replace this with real data fetching)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer); // Clean up the timer
    }, []);



    return (
        <div className="container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <div className="bg-background mx-auto max-w-7xl  sm:py-18 p-6 rounded-lg ">
                <h1 className="text-3xl font-bold mb-6">About Coffee Brewing</h1>

                {/* Section 1: Image Left, Text Right */}
                <section className="flex flex-col lg:flex-row items-center my-6">
                    <div className="lg:w-1/2">
                        <img
                            src="/images/barista-coffee-brewing.jpg"
                            alt="Barista preparing cappuccino"
                            className="w-full h-auto rounded-lg shadow-md"
                        />
                    </div>
                    <div className="lg:w-1/2 lg:pl-8">
                        <p className="text-gray-700 text-lg mb-4">
                            Java Heaven is a coffee lover's paradise, where the art of brewing transcends mere routine. We explore the intricacies of manual brewing techniques, such as pour-over, that elevate the flavor profile of every cup. From hands-on methods to cutting-edge machines, our approach to coffee brewing ensures a remarkable experience that enhances the taste and quality of your coffee.
                        </p>
                    </div>
                </section>

                {/* Section 2: Text Left, Image Right */}
                <section className="flex flex-col lg:flex-row-reverse items-center my-6">
                    <div className="lg:w-1/2">
                        <img
                            src="/images/coffee-beans-background.jpg"
                            alt="Variety of coffee beans"
                            className="w-full h-auto rounded-lg shadow-md"
                        />
                    </div>
                    <div className="lg:w-1/2 lg:pr-8">
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Coffee Beans</h2>
                        <p className="text-gray-700 text-lg mb-4">
                            The choice of coffee beans and their grind size plays a crucial role in determining the flavor of your brew. Each type of bean offers a unique array of flavors and aromas, making every brewing session an adventure in taste.
                        </p>
                    </div>
                </section>

                {/* Section 3: Image Left, Text Right */}
                <section className="flex flex-col lg:flex-row items-center my-6">
                    <div className="lg:w-1/2">
                        <img
                            src="/images/coffee-machine-making-perfect-cup-coffee.jpg"
                            alt="Coffee machine brewing coffee"
                            className="w-full h-auto rounded-lg shadow-md"
                        />
                    </div>
                    <div className="lg:w-1/2 lg:pl-8">
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Coffee Machine</h2>
                        <p className="text-gray-700 text-lg mb-4">
                            Our state-of-the-art coffee machines provide unmatched consistency in brewing. By automating the process, they allow for precise control over critical brewing variables like temperature and timing, ensuring a perfect cup every time.
                        </p>
                    </div>
                </section>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Why Java Heaven Matters</h2>
                <p className="text-gray-700 text-lg mb-4">
                    Brewing coffee goes beyond simply combining ground beans with hot water. It involves a deep understanding of how temperature, grind size, brewing time, and equipment can dramatically influence the flavor profile of your coffee. Even the same beans can yield vastly different tastes depending on the brewing method employed!
                </p>
            </div>
        </div>
    );
}
