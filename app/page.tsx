/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client'

import 'rc-slider/assets/index.css'
import Layout from './layout'
import React, { useEffect, useState, useRef } from 'react'
import './globals.css'
import Player from './components/WaveSurferPlayer'

export default function Home () {
  const [audioFile, setAudioFile] = useState<string | undefined>(undefined)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('None')

  const [selectedRange, setSelectedRange] = useState<number[]>([0, 0])

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ((event.target.files?.[0]) != null) {
      event.preventDefault()
      setSelectedFile(event.target.files[0])
      setFileName(event.target.files[0].name)
      setAudioFile(URL.createObjectURL(event.target.files[0]))
    }
  }

  const regionUpdatedHandler = (start: number, end: number) => {
    setSelectedRange([start, end])
  }

  const fileUploadHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const formData = new FormData()
    if (selectedFile != null) {
      formData.append('myFile', selectedFile, selectedFile.name)
      formData.append('startTime', selectedRange[0].toString())
      // offset used for delay in loop
      const offset = 0.08
      formData.append('endTime', (selectedRange[1] + offset).toString())
      console.log(...formData)
      // Used for sending to loop
      const res = fetch('http://localhost:3001/api/loop', {
        method: 'POST',
        body: formData
      })
    }
  }

  // ref for keeping track of current range
  const selectedRangeRef = useRef(selectedRange)
  useEffect(() => {
    selectedRangeRef.current = selectedRange
  }, [selectedRange])

  return (
    <div className="flex flex-col items-center justify-center pb-8 overflow-x-auto">
      <h1 className="font-bold p-8 text-4xl text-center bg-blue-200 m-8">MP3 Looper</h1>
      <input className="flex-1" type="file" accept=".mp3" onChange={fileSelectedHandler} />
      {audioFile != null &&
        <div className="center-screen w-full" style={{ whiteSpace: 'nowrap' }}>
          <Player
            key={audioFile}
            audioLink={audioFile}
            title={fileName}
            onRegionUpdated={regionUpdatedHandler}
          />
        </div>
      }
      <button className="bg-orange-200 rounded-md px-4 py-2 mt-4" onClick={fileUploadHandler}>Upload</button>
    </div>
  )
}
