import { useState, useEffect } from 'react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-sm text-darkTextSecondary font-mono tracking-wider bg-darkBg px-3 py-1.5 rounded-md border border-darkBorder hidden sm:block whitespace-nowrap">
      {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      <span className="mx-2 text-darkBorder">|</span>
      {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

export default LiveClock;