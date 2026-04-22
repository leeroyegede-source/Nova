const files = {
  "App.js": `
    import React, { useState } from 'react';
    export default function App() {
      const [c, setC] = useState(0);
      return <div onClick={() => setC(c+1)}>{c}</div>;
    }
  `
};

fetch('http://localhost:3000/api/compile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ files })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
