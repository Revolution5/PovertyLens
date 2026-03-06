// Created by Marisol 2/17/2026

"use client"
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { describe } from 'node:test';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="welcome-back"]',
    title: 'Welcome Back to PovertyLens!',
    description: 'Thank you so much for coming back to PovertyLens! We are thrilled to have as you as part of our community. We are committed to providing you with the best experience possible as you explore and learn about global poverty through our platform.',
    position: 'bottom'
  },
  {
    target: '[data-tour="upload-story"]',
    title: 'Upload Your Story',
    description: 'Share your own story about poverty or how you are helping to fight it. This helps us build a more complete picture of global poverty and its solutions. Your story can inspire others and contribute to our collective understanding of this important issue. We can\'t wait to hear from you!',
    position: 'right'
  },
  {
    target: '[data-tour="view-stories"]',
    title: 'View Your Stories',
    description: 'See all the stories you have uploaded and track their current status. Here you can see if your story is uploaded, archived, or if you wish to delete it. We hope you find this feature useful for managing your contributions to our platform and sharing your experiences with others.',
    position: 'left'
  },
  {
    target: '[data-tour="play-freeRice"]',
    title: 'Combat Hunger with FreeRice',
    description: 'Play FreeRice to help combat hunger around the world! For every correct answer, FreeRice donates 10 grains of rice to those in need. It\'s a fun and educational way to make a real difference in the fight against global hunger. We encourage you to give it a try and see how much you can contribute! We also have a leaderboard to track your progress and see how you stack up against other users. Let\'s work together to make a positive impact on the world!',
    position: 'right'
  },
  {
    target: '[data-tour="donate-now"]',
    title: 'Want to Make a Difference?',
    description: 'Consider making a donation to various organizations that are working to fight poverty and hunger around the world. Your support can help provide essential resources and support to those in need. Every contribution, no matter how small, can make a significant impact in the lives of those affected by poverty. ',
    position: 'left'
  },
  {
    target: '[data-tour="pledge-wall"]',
    title: 'Take the Pledge',
    description: 'Take the pledge to help fight poverty and hunger around the world. Your commitment can make a real difference in the lives of those affected by these issues. ',
    position: 'top'
  },
  {
    target: '[data-tour="bottom-cards"]',
    title: 'Explore Your Bottom Cards',
    description: 'Our bottom cards showcase your own personal statistics regarding the total stories you have shared, how many grains of rice you have donates, and for easy access any favorites resources.',
    position: 'top'
  }
];
// End of tour steps - Marisol 2/17/2026

// ============== UserAppTour Component - Marisol 2/18/2026 ==============
// Mirrors the structure of AppTour.tsx but targets user dashboard elements
// (data-tour attributes: welcome-back, upload-story, view-stories, play-freeRice, donate-now, bottom-cards)

interface UserAppTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserAppTour({ isOpen, onClose }: UserAppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isDark, setIsDark] = useState(false);

  // ============== Dark mode detection ==============
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  // ============== End dark mode detection ==============

  // ============== Position calculation effect - Marisol 2/24/2026 ==============
  // Finds the target element for the current step, computes highlight box and tooltip
  // coordinates, and scrolls the element into the center of the viewport.
  // Re-runs whenever currentStep or isOpen changes, and also on resize/scroll.
  useEffect(() => {
    if (!isOpen) return;

    const updatePositions = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);

      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8; // px of breathing room around the highlighted element

        setHighlightPosition({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        });

        // Tooltip sizing constants (approximate, used for boundary clamping)
        let tooltipTop = 0;
        let tooltipLeft = 0;
        const tooltipWidth = 384;  // matches max-w-sm (384px)
        const tooltipHeight = 300; // increased vs AppTour because user step descriptions are longer
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 20; // minimum gap between tooltip and viewport edge

        // Initial placement based on the step's preferred position
        switch (step.position) {
          case 'bottom':
            tooltipTop = rect.bottom + 20;
            tooltipLeft = rect.left + rect.width / 2; // center-aligned horizontally
            break;
          case 'top':
            tooltipTop = rect.top - tooltipHeight - 20;
            tooltipLeft = rect.left + rect.width / 2; // center-aligned horizontally
            break;
          case 'right':
            tooltipTop = rect.top + rect.height / 2; // center-aligned vertically
            tooltipLeft = rect.right + 20;
            break;
          case 'left':
            tooltipTop = rect.top + rect.height / 2; // center-aligned vertically
            tooltipLeft = rect.left - tooltipWidth - 20; 
            break;
        }

        // Clamp horizontal position so tooltip never clips the viewport edge
        if (step.position === 'bottom' || step.position === 'top') {
          const halfWidth = tooltipWidth / 2;
          if (tooltipLeft - halfWidth < margin) {
            tooltipLeft = halfWidth + margin; // push right
          } else if (tooltipLeft + halfWidth > viewportWidth - margin) {
            tooltipLeft = viewportWidth - halfWidth - margin; // push left
          }
        } else if (step.position === 'right') {
          // If no room on right, flip to left side
          if (tooltipLeft + tooltipWidth > viewportWidth - margin) {
            tooltipLeft = rect.left - tooltipWidth - 20;
          }
        } else if (step.position === 'left') {
          // [Your Name] 3/6/26 - If tooltip would be cut off on the left, flip to right side of the card
          if (tooltipLeft < margin) {
            tooltipLeft = rect.right + 20;
          }
          // [Your Name] 3/6/26 - Clamp so it never goes beyond the right edge on any screen width
          if (tooltipLeft + tooltipWidth > viewportWidth - margin) {
            tooltipLeft = viewportWidth - tooltipWidth - margin;
          }
        }

        // Clamp vertical position so tooltip never clips the viewport edge
        if (step.position === 'left' || step.position === 'right') {
          const halfHeight = tooltipHeight / 2;
          if (tooltipTop - halfHeight < margin) {
            tooltipTop = halfHeight + margin; // push down
          } else if (tooltipTop + halfHeight > viewportHeight - margin) {
            tooltipTop = viewportHeight - halfHeight - margin; // push up
          }
        } else if (step.position === 'bottom') {
          // If no room below, flip to above the element
          if (tooltipTop + tooltipHeight > viewportHeight - margin) {
            tooltipTop = rect.top - tooltipHeight - 20;
          }
        } else if (step.position === 'top') {
          // If no room above, flip to below the element
          if (tooltipTop < margin) {
            tooltipTop = rect.bottom + 20;
          }
        }

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

        // Smooth-scroll so the highlighted element is vertically centered in the viewport
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const offset = window.innerHeight / 2 - rect.height / 2;
        window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
      }
    };

    updatePositions();
    const timer = setTimeout(updatePositions, 100); // small delay for late-rendering elements

    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [currentStep, isOpen]);
  // ============== End position calculation effect ==============

  if (!isOpen) return null;

  // Advance to next step, or close the tour on the last step
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  // Go back one step (disabled on step 0 via button attribute)
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Dimmed overlay - clicking it closes the tour */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Highlight cutout - sits above the overlay, outlines the target element with an orange ring */}
      <div
        className="fixed z-[9999] pointer-events-none transition-all duration-300 ease-in-out"
        style={{
          top: `${highlightPosition.top}px`,
          left: `${highlightPosition.left}px`,
          width: `${highlightPosition.width}px`,
          height: `${highlightPosition.height}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 3px #FFA239', // large outer shadow creates the dim effect; inner ring is the orange border
          borderRadius: '8px'
        }}
      />

      {/* Tooltip card - positioned relative to the highlighted element */}
      <div
        className="fixed z-[10000] rounded-lg shadow-xl p-6 transition-all duration-300 ease-in-out pointer-events-auto"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          maxWidth: '384px',
          width: '90vw',       // shrinks gracefully on mobile
          maxHeight: '80vh',   // prevents overflow on short viewports
          overflowY: 'auto',
          backgroundColor: 'var(--background)',
          border: `2px solid ${isDark ? 'rgba(255, 162, 57, 0.5)' : '#FFA239'}`, // softer border in dark mode
          // Transform offsets the tooltip so it is centered or edge-aligned relative to its anchor point
          transform: step.position === 'bottom' || step.position === 'top'
            ? 'translateX(-50%)'          // center horizontally over/under element
            : 'translateY(-50%)'          // center vertically beside element (both left and right)
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 transition-colors hover:scale-110"
          style={{ color: 'var(--color-gray)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step title */}
        <h3
          className="text-lg font-semibold mb-2 pr-6"
          style={{ color: 'var(--foreground)' }}
        >
          {step.title}
        </h3>

        {/* Step description */}
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-gray-dark)' }}
        >
          {step.description}
        </p>

        {/* Footer: step counter + navigation buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: 'var(--color-gray)' }}>
            Step {currentStep + 1} of {tourSteps.length}
          </div>

          <div className="flex gap-2">
            {/* Back button - disabled on first step */}
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-3 py-2 text-sm rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: 'var(--foreground)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Next / Finish button */}
            <button
              onClick={handleNext}
              className="px-3 py-2 text-sm rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)' }}
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
// ============== End UserAppTour Component - Marisol ==============