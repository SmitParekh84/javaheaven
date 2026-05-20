import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter, faFacebook, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';

const teamMembers = [
    {
        name: 'Smit Parekh',
        title: 'Project Manager & Full-Stack Developer',
        position: 'Founder & CEO',
        image: '/Smit-Parekh.jpg', // Replace with your image paths
        description: 'With a solid foundation in both project management and full-stack development, Smit combines technical expertise with leadership skills. He excels in driving projects from conception to completion, ensuring that each phase aligns with strategic goals. His passion for innovation and dedication to team collaboration empower the organization to deliver exceptional results.',
        socialLinks: {
            linkedin: 'https://linkedin.com/in/smitparekh84',
            github: 'https://github.com/SmitParekh84',
            instagram: 'https://www.instagram.com/smit_8_4',
        },
    },
    {
        name: 'Preet Patel',
        title: 'Back-End Developer & White Box Tester',
        position: 'Co-Founder & COO',
        image: '/Preet-Patel.jpg', // Replace with your image paths
        description: 'Preet is a talented back-end developer with a keen eye for detail. His expertise in white box testing ensures that the systems we build are robust and efficient. Preets ability to identify potential issues before they become problems contributes significantly to the quality of our software solutions, making him an invaluable asset to our development team.',
        socialLinks: {
            linkedin: 'https://www.linkedin.com/in/preet-patel-8b4617256/',
            github: 'https://github.com/preetpatel9341',
            instagram: 'https://www.instagram.com/preetpatel9341',
        },
    },
    {
        name: 'Dhru Patel',
        title: 'Quality Assurance Tester',
        position: 'QA Lead',
        image: '/Dhru-Patel.jpg', // Replace with your image paths
        description: 'Dhru is dedicated to ensuring that our products meet the highest standards of quality. With a strong background in testing methodologies, he meticulously evaluates software functionality, performance, and usability. His commitment to delivering a seamless user experience drives the continuous improvement of our applications.',
        socialLinks: {
            linkedin: 'https://www.linkedin.com/in/dhru-patel-3849892b3',
            github: 'https://github.com/PatelDHRU26',
            instagram: 'https://www.instagram.com/dp_dhru',
        },
    },
];

const DEFAULT_IMAGE = "https://cloud-atg.moph.go.th/quality/sites/default/files/default_images/default.png";



const LeadershipTeam = () => {
    return (
        <section className="container mx-auto max-w-7xl pt-0 sm:py-18 lg:pt-0">
            <h2 className="text-center text-4xl font-bold text-gray-800 mb-8">Our Leadership Team</h2>
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
                {teamMembers.map((member) => (
                    <div key={member.name} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform  hover:scale-105">
                        <a
                            href={member.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} LinkedIn`}
                            className=" transition-colors duration-200"
                        >


                            <img
                                src={member.image || DEFAULT_IMAGE}
                                alt={member.name}
                                className="w-full h-auto max-h-48 object-cover transition-opacity duration-300 hover:opacity-75" /> </a>
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-1">{member.name}</h3>
                            <p className="text-gray-600 text-sm mb-0">{member.title}</p>
                            <p className="text-gray-600 text-sm mb-3">{member.position}</p>
                            <p className="text-gray-700 mb-4">{member.description}</p>
                            <div className="flex justify-center space-x-4">
                                <a
                                    href={member.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${member.name} LinkedIn`}
                                    className=" hover:text-secondary/90 duration-200 "
                                >
                                    <FontAwesomeIcon icon={faLinkedin} className="h-6 w-6 " />
                                </a>
                                <a
                                    href={member.socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${member.name} Twitter`}
                                    className=" hover:text-secondary/90  transition-colors duration-200"
                                >
                                    <FontAwesomeIcon icon={faGithub} className="h-6 w-6" />
                                </a>
                                <a
                                    href={member.socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${member.name} Facebook`}
                                    className=" hover:text-secondary/90  transition-colors duration-200"
                                >
                                    <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
                                </a>
                            </div>

                        </div>

                    </div>
                ))}
            </div>
        </section >

    );
};

export default LeadershipTeam;
