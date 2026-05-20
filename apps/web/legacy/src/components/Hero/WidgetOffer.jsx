import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./custom-slick.css";
import Modal from "./Modal"; // Import the Modal component

const offers = [
  {
    title: "Java Heaven Rewards",
    description: "Collect Stars Any Way You Pay. Rewards got a makeover—no surprises, just perks!",
    validity: "Valid until December 31, 2024",
    terms: "Terms and conditions apply.",
    additionalInfo: "Earn extra stars for every purchase made through our app.",
    imageUrl: "/images/offers/Java Heaven Rewards.jpg",
  },
  {
    title: "Brewed Awakening Special",
    description: "Enjoy a 50% discount on any brewed coffee during Happy Hours from 3 PM to 5 PM!",
    validity: "Every Monday to Friday",
    terms: "Only valid for brewed coffee, dine-in only.",
    additionalInfo: "Come early to secure your favorite blend!",
    imageUrl: "/images/offers/Brewed Awakening Special.jpeg",
  },
  {
    title: "Pastry Pairing Promo",
    description: "Get a free pastry with the purchase of any large coffee. Perfect pairings for your coffee break!",
    validity: "Valid until November 30, 2024",
    terms: "Free pastry must be of equal or lesser value.",
    additionalInfo: "Choose from our daily fresh selection of pastries.",
    imageUrl: "/images/offers/Pastry Pairing Promo.webp",
  },
  {
    title: "Seasonal Pumpkin Spice Latte",
    description: "Try our limited-time Pumpkin Spice Latte and get a loyalty stamp towards your next free drink!",
    validity: "Valid from October 1 to November 30, 2024",
    terms: "Loyalty stamp valid only with purchase of Pumpkin Spice Latte.",
    additionalInfo: "Sip into the season with this fall favorite!",
    imageUrl: "/images/offers/Seasonal Pumpkin Spice Latte.jpg",
  },
  {
    title: "Cappuccino Combo",
    description: "Buy any cappuccino and get a 20% discount on your next order!",
    validity: "Valid until December 15, 2024",
    terms: "Discount applies to the next order only.",
    additionalInfo: "Pair it with a sweet treat for an even better deal!",
    imageUrl: "/images/offers/Cappuccino Combo.jpg",
  },
  // Add more offers here
];



export default function WidgetOffer() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'linear',
  };

  const handleKnowMoreClick = (offer) => {
    setSelectedOffer(offer);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
      <Slider {...settings} className="flex justify-center">
        {offers.map((offer, index) => (
          <div key={index} className="px-2">
            <div className="flex flex-col items-center bg-secondary py-16 px-6 rounded-lg shadow-lg justify-between">
              <div className="flex flex-col md:flex-row items-center md:justify-start w-full">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-auto h-32 rounded-lg object-cover mb-4 md:mb-0 md:mr-4"
                  loading="lazy" // Lazy loading for better performance
                />
                <div className="text-center md:text-left">
                  <h2 className="text-muted-foreground text-sm">New Updates</h2>
                  <h1 className="text-primary text-xl font-bold">{offer.title}</h1>
                  <p className="text-muted-foreground">
                    {offer.description}
                  </p>
                  <div className='flex lg:justify-start justify-center items-center'>
                    <button
                      className="bg-primary-foreground text-secondary py-2 px-4 my-2 rounded-full flex items-center shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
                      aria-label={`Learn more about ${offer.title}`} // Added aria-label for accessibility
                      onClick={() => handleKnowMoreClick(offer)} // Handle click event
                    >
                      <span>Know more</span>
                      <ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon> {/* Hiding icon from screen readers */}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Modal for displaying offer details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        offer={selectedOffer}
      />
    </div>
  );
}
