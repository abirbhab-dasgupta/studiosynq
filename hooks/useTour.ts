import { useState } from "react";

const TOUR_KEY = "studiosynq:tour:done";

export function useTour() {
    const [shouldShow, setShouldShow] = useState(() => {
        const done = localStorage.getItem(TOUR_KEY);
        return !done;
    });

    function completeTour() {
        localStorage.setItem(TOUR_KEY, "true");
        setShouldShow(false);
    }

    function skipTour() {
        localStorage.setItem(TOUR_KEY, "true");
        setShouldShow(false);
    }

    function resetTour() {
        localStorage.removeItem(TOUR_KEY);
        setShouldShow(true);
    }

    return { shouldShow, completeTour, skipTour, resetTour };
}