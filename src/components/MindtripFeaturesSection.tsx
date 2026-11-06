'use client';

import React from 'react';
import Image from 'next/image';

export const MindtripFeaturesSection: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 bg-[#f8f9fa] border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline from Reference */}
        <div className="mb-12 max-w-4xl">
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-800 tracking-tight leading-snug">
            Stay ahead, plan, book and explore with help from an assistant that gets how you travel.
          </p>
        </div>

        {/* 4 Cards Grid / Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Watch */}
          <div className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200/70 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
            <div>
              {/* Eye Icon */}
              <div className="mb-6 w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12.0001 14.7636C12.7332 14.7636 13.4363 14.4724 13.9547 13.954C14.4731 13.4356 14.7643 12.7325 14.7643 11.9994C14.7643 11.2662 14.4731 10.5631 13.9547 10.0447C13.4363 9.52634 12.7332 9.23511 12.0001 9.23511C11.267 9.23511 10.5639 9.52634 10.0455 10.0447C9.52707 10.5631 9.23584 11.2662 9.23584 11.9994C9.23584 12.7325 9.52707 13.4356 10.0455 13.954C10.5639 14.4724 11.267 14.7636 12.0001 14.7636Z"
                    stroke="black"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.3691 11.0614C20.877 11.613 20.877 12.3868 20.3691 12.9383C18.9746 14.4844 15.804 17.5764 12.0001 17.5764C8.19538 17.5764 5.02558 14.5947 3.63035 12.9383C3.12322 12.386 3.12322 11.613 3.63035 11.0614C5.02558 9.51537 8.19538 6.42334 12.0001 6.42334C15.804 6.42334 18.9746 9.51537 20.3691 11.0614Z"
                    stroke="black"
                    strokeWidth="1.4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="mb-2.5 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Watch</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stay ahead with automatic alerts, or create agents to keep tabs on whatever matters to you.
              </p>
            </div>

            {/* Illustration */}
            <div className="mt-8 -mb-2 -mr-3 flex justify-end">
              <Image
                src="/img/hp-watch.png"
                alt="Watch"
                width={260}
                height={288}
                className="w-auto h-52 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Card 2: Build */}
          <div className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200/70 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
            <div>
              {/* Briefcase Icon */}
              <div className="mb-6 w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7.62069 7.10345V5.81034C7.62069 5.33021 7.81142 4.86974 8.15093 4.53024C8.49043 4.19073 8.9509 4 9.43103 4H13.569C14.0491 4 14.5096 4.19073 14.8491 4.53024C15.1886 4.86974 15.3793 5.33021 15.3793 5.81034V7.10345M7.62069 7.10345H5.81034C4.81052 7.10345 4 7.91397 4 8.91379V17.1897C4 18.1895 4.81052 19 5.81034 19H17.1897C18.1895 19 19 18.1895 19 17.1897V8.91379C19 7.91397 18.1895 7.10345 17.1897 7.10345H15.3793M7.62069 7.10345H15.3793"
                    stroke="black"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="mb-2.5 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Build</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create a trip around how you travel and keep your itinerary, ideas and bookings all in one place.
              </p>
            </div>

            {/* Illustration */}
            <div className="mt-8 -mb-2 -mx-3 flex justify-center">
              <Image
                src="/img/hp-build.png"
                alt="Build"
                width={325}
                height={215}
                className="w-auto h-52 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Card 3: Book */}
          <div className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200/70 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
            <div>
              {/* Star Icon */}
              <div className="mb-6 w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12.6299 4.40153L14.6741 8.52868C14.7206 8.63343 14.7938 8.72417 14.8863 8.79184C14.9788 8.85952 15.0874 8.90177 15.2013 8.91439L19.7141 9.58296C19.8448 9.59976 19.968 9.65338 20.0693 9.73758C20.1707 9.82177 20.2459 9.93306 20.2864 10.0584C20.3268 10.1838 20.3308 10.3181 20.2977 10.4457C20.2647 10.5732 20.1961 10.6887 20.0999 10.7787L16.847 14.0058C16.764 14.0834 16.7017 14.1805 16.6657 14.2883C16.6298 14.396 16.6214 14.5111 16.6413 14.623L17.4256 19.1615C17.4483 19.2919 17.4339 19.4261 17.3841 19.5488C17.3344 19.6714 17.2511 19.7776 17.144 19.8553C17.0368 19.933 16.91 19.9791 16.7779 19.9883C16.6459 19.9975 16.5139 19.9694 16.397 19.9072L12.3341 17.7601C12.2301 17.709 12.1157 17.6825 11.9999 17.6825C11.884 17.6825 11.7696 17.709 11.6656 17.7601L7.60271 19.9072C7.48582 19.9694 7.35384 19.9975 7.22178 19.9883C7.08973 19.9791 6.9629 19.933 6.85573 19.8553C6.74856 19.7776 6.66534 19.6714 6.61556 19.5488C6.56578 19.4261 6.55143 19.2919 6.57414 19.1615L7.35842 14.5715C7.3783 14.4597 7.36989 14.3446 7.33396 14.2368C7.29804 14.129 7.23573 14.032 7.15271 13.9544L3.86128 10.7787C3.7639 10.6862 3.69542 10.5675 3.66413 10.437C3.63284 10.3064 3.64009 10.1695 3.68499 10.043C3.72989 9.91645 3.81052 9.80564 3.91712 9.72399C4.02371 9.64234 4.1517 9.59336 4.28557 9.58296L8.79842 8.91439C8.91233 8.90177 9.02095 8.85952 9.11344 8.79184C9.20593 8.72417 9.27907 8.63343 9.32557 8.52868L11.3699 4.40153C11.4255 4.28133 11.5144 4.17956 11.626 4.10824C11.7377 4.03692 11.8674 3.99902 11.9999 3.99902C12.1323 3.99902 12.262 4.03692 12.3737 4.10824C12.4853 4.17956 12.5742 4.28133 12.6299 4.40153Z"
                    stroke="black"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="mb-2.5 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Book</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Find and book flights, stays and restaurants that match your priorities.
              </p>
            </div>

            {/* Illustration */}
            <div className="mt-8 -mb-2 flex justify-center">
              <Image
                src="/img/hp-book.png"
                alt="Book"
                width={260}
                height={194}
                className="w-auto h-52 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Card 4: Explore */}
          <div className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200/70 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
            <div>
              {/* Navigation Paper Plane Icon */}
              <div className="mb-6 w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.4798 4.20696C18.3492 4.22627 18.9399 4.03551 11.4778 6.46819C6.83302 7.98244 4.8447 8.6383 4.75875 8.68451C4.69159 8.7206 4.58829 8.79791 4.52916 8.8563C4.00734 9.3717 4.1092 10.2142 4.7389 10.591C4.80706 10.6318 6.06568 11.326 7.53583 12.1337C10.3905 13.7019 10.2911 13.6426 10.3803 13.8316C10.4024 13.8785 10.9509 15.0955 11.5991 16.5359C12.2474 17.9764 12.7923 19.1835 12.8101 19.2184C13.049 19.6873 13.6292 19.919 14.1347 19.7474C14.3744 19.666 14.6242 19.4508 14.7388 19.2269C14.8302 19.0484 19.7521 5.71811 19.7868 5.55523C19.8537 5.24068 19.7623 4.87778 19.5515 4.62081C19.286 4.29705 18.8941 4.14572 18.4798 4.20696ZM12.0854 7.63095C8.62288 8.76081 5.79598 9.69098 5.80338 9.69798C5.81078 9.705 6.94678 10.3319 8.32783 11.0912C9.70888 11.8504 10.8915 12.5088 10.9558 12.5541C11.121 12.6705 11.3017 12.8588 11.4135 13.0313C11.5174 13.1916 11.5319 13.223 12.8559 16.1698C13.3503 17.2703 13.7595 18.1654 13.7652 18.1588C13.7759 18.1465 18.3886 5.66368 18.4035 5.60638C18.4082 5.58853 18.405 5.57454 18.3964 5.5753C18.3878 5.57605 15.5479 6.50109 12.0854 7.63095Z"
                    fill="black"
                  />
                </svg>
              </div>

              <h3 className="mb-2.5 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explore</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Find great places, events and things to do based on where you are and what you’re into.
              </p>
            </div>

            {/* Illustration */}
            <div className="mt-8 -mb-2 -mr-1 flex justify-end">
              <Image
                src="/img/hp-explore.png"
                alt="Explore"
                width={243}
                height={224}
                className="w-auto h-52 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

