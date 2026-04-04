// Created by Marisol Morales 2/4/2026

// Directive to mark this as a client-side component in Next.js (runs in browser, not server)
"use client";

// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Import icon components from lucide-react library
import { MapPin, Send } from 'lucide-react';

// Main Contact component - exported as default for use in other files
export default function Contact() {
  // State to store form input values (name, email, subject, message)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // State to track whether the form has been successfully submitted
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State to track if dark mode is currently active
  const [isDark, setIsDark] = useState(false);

  // ============== Dark Mode Detection - Listen for theme changes 2/10/2026 ============== //
  // useEffect hook runs when component mounts and sets up dark mode detection
  useEffect(() => {
    // Check initial theme by looking for 'dark' class on root html element
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for theme changes using MutationObserver (watches for DOM changes)
    const observer = new MutationObserver(() => {
      // Update dark mode state whenever the class attribute changes
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    // Start observing the html element for class attribute changes
    observer.observe(document.documentElement, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ['class'] // Only watch the 'class' attribute
    });

    // Cleanup function: disconnect observer when component unmounts
    return () => observer.disconnect();
  }, []); // Empty dependency array means this runs once on mount
  // ============== End Dark Mode Detection ============== //

  // Handler function for form input changes (name, email, subject, message)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Update formData state by spreading existing values and updating the changed field
    setFormData({
      ...formData, // Keep all existing form values
      [e.target.name]: e.target.value, // Update only the field that changed
    });
  };

  // Handler function for form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send.');
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  } catch (err) {
    console.error('Contact form error:', err);
  }
};

  return (
    // ============== Marisol Dark Mode: Updated background 2/10/2026 ============== //
    // Main container with full viewport height and dynamic background color based on CSS variables
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
    {/* ============== Marisol End Dark Mode Background 2/10/2026 ============== */}
      {/* Main content wrapper with responsive padding and centered content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Vertical padding that adjusts based on screen size */}
        <div className="py-16 lg:py-20">
          {/* Header Section */}
          {/* Centered text container with bottom margin */}
          <div className="text-center mb-12">
            {/* Main page heading with responsive font sizes */}
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              {/* Gradient text effect from orange to red */}
              <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            {/* ============== Marisol Dark Mode: Updated text color 2/10/2026 ============== */}
            {/* Subtitle with constrained width and dynamic color */}
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-gray)' }}>
              Have questions or want to learn more about our mission? We'd love to hear from you.
            </p>
            {/* ============== Marisol End Dark Mode Text 2/10/2026 ============== */}
          </div>

          {/* Two-column grid layout that stacks on mobile and sits side-by-side on large screens */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left side - Contact Information */}
            <div>
              {/* ============== Marisol Dark Mode: Updated heading color 2/10/2026 ============== */}
              {/* Section heading with dynamic color */}
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Contact Information
              </h2>
              {/* Introductory paragraph with comfortable line spacing */}
              <p className="mb-8 leading-relaxed" style={{ color: 'var(--color-gray)' }}>
                Reach out to us through any of the following channels. Our team is here to help and will respond to your inquiry as soon as possible.
              </p>
              {/* ============== Marisol End Dark Mode Heading 2/10/2026 ============== */}

              {/* Contact Details - Only Address */}
              {/* Container for contact detail items with vertical spacing */}
              <div className="space-y-6 mb-10">
                {/* Address item with icon and text */}
                <div className="flex items-start gap-4">
                  {/* Circular icon container with gradient background */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.2) 0%, rgba(255, 162, 57, 0.2) 100%)' }}
                  >
                    {/* Map pin icon in orange */}
                    <MapPin size={20} className="text-orange-500" />
                  </div>
                  {/* ============== Marisol Dark Mode: Updated address text colors 2/10/2026 ============== */}
                  {/* Address text container */}
                  <div>
                    {/* Address label */}
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                      Address
                    </h3>
                    {/* Multi-line address */}
                    <p style={{ color: 'var(--color-gray)' }}>
                      1250 N Bellflower Blvd<br />
                      Long Beach, CA 90840<br />
                      United States
                    </p>
                  </div>
                  {/* ============== End Dark Mode Address ============== */}
                </div>
              </div>
            </div>

            {/* Right side - Contact Form */}
            <div>
              {/* ============== Marisol Dark Mode: Updated form container background 2/10/2026 ============== */}
              {/* Form container with rounded corners, padding, and dynamic gradient background */}
              <div 
                className="p-8 rounded-2xl"
                style={{ 
                  // Conditional gradient opacity based on dark mode (darker in dark mode)
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(140, 228, 255, 0.03) 0%, rgba(255, 162, 57, 0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(140, 228, 255, 0.05) 0%, rgba(255, 162, 57, 0.05) 100%)',
                  // Dynamic border color based on dark mode
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
              {/* ============== End Dark Mode Form Container ============== */}
                {/* Form heading */}
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                  Send us a Message
                </h2>
                
                {/* Conditional rendering: show success message OR form */}
                {isSubmitted ? (
                  // Success message displayed after form submission
                  <div 
                    className="p-6 rounded-xl text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.2) 0%, rgba(255, 162, 57, 0.2) 100%)' }}
                  >
                    {/* Success icon container */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      {/* Send icon in green */}
                      <Send size={28} className="text-green-600" />
                    </div>
                    {/* Success heading */}
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                      Message Sent!
                    </h3>
                    {/* Success message text */}
                    <p style={{ color: 'var(--color-gray)' }}>
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  // Contact form (shown when not submitted)
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    {/* ============== Marisol Dark Mode: Updated form field styles 2/10/2026 ============== */}
                    <div>
                      {/* Label for name input */}
                      <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Full Name *
                      </label>
                      {/* Text input for name with focus states and dynamic styling */}
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required // Makes field mandatory
                        value={formData.name} // Controlled input bound to state
                        onChange={handleChange} // Update state on change
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--background)', // Dynamic background
                          borderColor: 'var(--color-gray-light)', // Dynamic border
                          color: 'var(--foreground)' // Dynamic text color
                        }}
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      {/* Label for email input */}
                      <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Email Address *
                      </label>
                      {/* Email input with validation */}
                      <input
                        type="email" // Browser validates email format
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Subject Field */}
                    <div>
                      {/* Label for subject dropdown */}
                      <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Subject *
                      </label>
                      {/* Dropdown select for subject categories */}
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                      >
                        {/* Dropdown options */}
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="donation">Donation Information</option>
                        <option value="volunteer">Volunteer Opportunities</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Message Field */}
                    <div>
                      {/* Label for message textarea */}
                      <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Message *
                      </label>
                      {/* Multi-line textarea for message content */}
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5} // Sets initial height to 5 lines
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    {/* ============== End Dark Mode Form Fields ============== */}

                    {/* Submit Button */}
                    {/* Full-width button with gradient background and hover effects */}
                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #8CE4FF 0%, #FFA239 100%)' }}
                    >
                      {/* Send icon */}
                      <Send size={18} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}