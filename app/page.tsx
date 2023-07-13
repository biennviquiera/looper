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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [selectedRange, setSelectedRange] = useState<number[]>([0, 0])
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ((event.target.files?.[0]) != null) {
      const file = event.target.files[0]
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      event.preventDefault()
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('Selected file is too large! Upload a file smaller than 10MB.')
      } else {
        setErrorMessage(null)
        setSelectedFile(file)
        setFileName(file.name)
        setAudioFile(URL.createObjectURL(file))
      }
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
      // Used for sending to loop
      fetch('http://localhost:3001/api/loop', {
        method: 'POST',
        body: formData
      }).then(async response => {
        if (!response.ok) {
          const data = await response.json()
          if (response.status === 429) { // status code for rate limit
            setErrorMessage('You have reached the upload limit. Try again in 15 minutes.')
          } else {
            console.error('An error occurred', data)
          }
        } else {
          const data = await response.json()
          console.log('output is', data.downloadUrl)
          setDownloadUrl(data.downloadUrl)
        }
      }).catch(err => {
        console.error('A network error occurred', err)
      })
    }
  }

  // ref for keeping track of current range
  const selectedRangeRef = useRef(selectedRange)
  useEffect(() => {
    selectedRangeRef.current = selectedRange
  }, [selectedRange])

  const handleClick = () => {
    if (fileInputRef != null) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center pb-8 overflow-x-auto">
      <h1 className="font-bold p-8 text-4xl text-center bg-blue-200 m-8">MP3 Looper</h1>
      <input hidden className="flex-1" ref={fileInputRef} type="file" accept="audio/*" onChange={fileSelectedHandler} />
      <button className="bg-neutral-400 px-8 rounded-md" onClick={handleClick}>Select File</button>
      {(errorMessage != null) && <p style={{ color: 'red' }}>{errorMessage}</p>}
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
      {downloadUrl != null &&
      <div className="bg-neutral-200 rounded-md p-4 m-4 hover:bg-neutral-400">
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download looped file</a>
      </div>
      }
    </div>
  )
}
