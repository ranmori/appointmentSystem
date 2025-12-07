import React from 'react';
import { Outlet } from 'react-router-dom'; // Essential for nested routes
import NavBar from './NavBar'; // Your existing NavBar component
import SideBar from './sideBar'; // Your existing SideBar component

export default function Layout() {
  return (
    // This div sets up a flex container for the whole screen
    <div className="flex min-h-screen bg-gray-100 font-inter">
      {/* The SideBar takes a fixed width on the left */}
      <SideBar />

      {/* This div is the main content area, flexing to fill remaining space */}
      <div className="flex-1 flex flex-col">
        {/* The NavBar sits at the top of the main content area */}
        <NavBar />

        {/* The <main> tag contains the actual page content */}
        {/* <Outlet /> is where the element of the matched child route will render */}
        <main className="flex-1 p-6"> {/* flex-1 ensures it takes all available vertical space */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}