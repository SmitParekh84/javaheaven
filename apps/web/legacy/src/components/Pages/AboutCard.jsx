import { Link } from 'react-router-dom';

export default function AboutCard() {
  return (
    <div className="bg-background mx-auto max-w-7xl pt-10 sm:py-18 p-6 rounded-lg ">
      <h2 className="text-lg font-semibold mb-2">Learn more about the world of coffee!</h2>
      <div className="relative overflow-hidden rounded-lg">
        <img
          src="/images/About-banner.jpg"
          alt="A beautifully brewed cup of coffee"
          className="w-full h-56 sm:h-64 md:h-72 lg:h-96 xl:h-[500px] object-cover rounded-lg"
        />

        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-4">
          <span className="text-muted-foreground text-xs font-semibold py-1 rounded-full">
            Coffee Culture
          </span>
          <h3 className="text-white text-xl font-bold mt-2">Art & Science Of Coffee Brewing</h3>
          <p className="text-muted-foreground text-xs mt-1">
            Master the perfect brew! Learn the art and science of coffee brewing.
          </p>
          <Link to="/about">
            <button className="mt-4 inline-block w-full bg-muted-foreground text-center text-secondary px-4 py-2 rounded-lg hover:bg-muted-foreground/80">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
