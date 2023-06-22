'use client'

import Image from 'next/image';
import Layout from './layout';
import { useState } from 'react';
import './globals.css';
import { NextPageContext } from 'next';
import { useRouter } from 'next/navigation';

Home.getInitialProps = async (ctx: NextPageContext) => {
  console.log("bruhmans");
  const res = await fetch('https://api.github.com/repos/vercel/next.js')
  const json = await res.json()
  return { stars: json.stargazers_count }
}

export default function Home({ stars }: { stars: number }) {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<String>("None");

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('bruh');

    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  }
  
  const fileUploadHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append('myFile', selectedFile, selectedFile.name);
      // TODO: make post request to endpoint
      // fetch('/your-endpoint', { method: 'POST', body: formData })
    }
  }

  return (
    <Layout className="container bg-neutral-200 mx-auto">
      <div className="flex-1">
        <h1 className="bg-blue-200 m-8 font-bold py-10 text-4xl text-center">MP3 Looper</h1>
        <div className="flex flex-col items-center justify-center">
          <input type="file" accept=".mp3" onChange={fileSelectedHandler} />
          <button className="bg-orange-200 rounded-md px-4 py-2 mt-4" onClick={fileUploadHandler}>Upload</button>
        </div>
      </div>
    </Layout>
  )
}
