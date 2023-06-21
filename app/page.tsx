"use client";

import Image from 'next/image';
import Layout from './layout';
import { useState } from 'react';
import './globals.css';


export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('bruh');

    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      console.log(selectedFile);
    }
  }
  
  const fileUploadHandler = () => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append('myFile', selectedFile, selectedFile.name);
      // TODO: make post request to endpoint
      // fetch('/your-endpoint', { method: 'POST', body: formData })
      console.log(formData);
    }
  }

  return (
    <Layout className="bg-neutral-400 min-h-screen">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <h1 className="bg-blue-200 p-16 m-8 font-bold py-10 text-4xl text-center">MP3 Looper</h1>
        <div className="flex flex-col items-center justify-center">
          <input type="file" accept=".mp3" onChange={fileSelectedHandler} />
          <button className="bg-orange-200 rounded-md px-4 py-2 mt-4" onClick={fileUploadHandler}>Upload</button>
        </div>
      </div>
    </Layout>
  )
}
