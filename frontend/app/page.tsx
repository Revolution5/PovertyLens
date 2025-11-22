"use client";
import Image from "next/image";

export default function Home() {
    const handleClick = async () => {
    try {
      const res = await fetch('http://localhost:4000', { method: 'GET' })
      const data = await res.json()
      console.log(data)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }
  return (
    <div>
      <button onClick={handleClick}>
      Click me
      </button>
    </div>
  );
}
