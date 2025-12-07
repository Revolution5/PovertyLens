"use client";
import Link from 'next/link';
import Image from "next/image";
import {useState, useEffect} from "react";

export default function SigninLogin() {
  //   const [count, setCount] = useState(0)

  //   // Load counter when page loads
  //   useEffect(() => {
  //   fetch("http://localhost:4000/api/counter")
  //     .then(res => res.json())
  //     .then(data => setCount(data.count));
  // }, []);

  // // Increase the counter
  // const handleClick = () => {
  //   fetch("http://localhost:4000/api/counter/increment", { method: "POST" })
  //     .then(res => res.json())
  //     .then(data => setCount(data.count));
  // };

  return (
    <div style={{ 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "40px",
      gap: "20px"
    }}>

      {/* <button onClick={handleClick}
      style={{
        backgroundColor: "#AC7F5E",
        color: "#371c01ff",
        fontSize: "30px",
        cursor: "pointer",
        borderRadius: "12px",
        padding: "12px 24px",
        
      }}>
      Click me
      </button>

    <div style= {{
      fontSize: "25px",
      color: "#371c01ff"
    }}>
      Total amount of clicks overall: 
    </div>

    <div style={{ 
      fontSize: "48px",
       fontWeight: "bold",
       color: "#AC7F5E" 
    }}>
      {count}
    </div> */}

      <div style={{ marginTop: '20px' }}>
        <Link href="/signin">
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Sign In / Log In
          </button>
        </Link>
      </div>
  </div>
  );
}
