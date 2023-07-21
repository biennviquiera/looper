/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client'

import 'rc-slider/assets/index.css'
import Layout from './layout'
import React, { useEffect, useState, useRef } from 'react'
import './globals.css'
import Player from './components/WaveSurferPlayer'
import { CircularProgress } from '@mui/material'

type Duration = '60' | '300' | '600'

export default function Home () {
  const [audioFile, setAudioFile] = useState<string | undefined>(undefined)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('None')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [selectedRange, setSelectedRange] = useState<number[]>([0, 0])
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [selectedLoopDuration, setSelectedLoopDuration] = useState<Duration>('60')

  const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ((event.target.files?.[0]) != null) {
      setDownloadUrl(null)
      const file = event.target.files[0]
      const MAX_FILE_SIZE = 20 * 1024 * 1024
      event.preventDefault()
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('Selected file is too large! Upload a file smaller than 20MB.')
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
      setDownloadUrl(null)
      setIsLoading(true)

      formData.append('myFile', selectedFile, selectedFile.name)
      formData.append('startTime', selectedRange[0].toString())
      // offset used for delay in loop=
      formData.append('endTime', (selectedRange[1]).toString())
      formData.append('duration', selectedLoopDuration.toString())
      console.log(selectedLoopDuration)

      // Used for sending to loop
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const loopEndPoint = `https://${process.env.NEXT_PUBLIC_EC2_IP_ADDRESS}/api/loop`
      console.log(loopEndPoint)
      fetch(loopEndPoint, {
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
          setIsLoading(false)
        }
      }).catch(err => {
        console.error('A network error occurred', err)
      })
    }
  }

  const handleSelectedDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLoopDuration(event.target.value as Duration)
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
      <h1 className="font-bold p-8 text-4xl text-center bg-blue-200 m-8">Audio Looper</h1>
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
      <div className="flex gap-4 m-2" >
        <label>
          <input
            className="mx-2"
            type="radio"
            value="60"
            checked={selectedLoopDuration === '60'}
            onChange={handleSelectedDurationChange}
          />
          1 minute
        </label>
        <label>
          <input
            className="mx-2"
            type="radio"
            value="300"
            checked={selectedLoopDuration === '300'}
            onChange={handleSelectedDurationChange}
          />
          5 minutes
        </label>
        <label>
          <input
            className="mx-2"
            type="radio"
            value="600"
            checked={selectedLoopDuration === '600'}
            onChange={handleSelectedDurationChange}
          />
          10 minutes
        </label>
      </div>
      <button
        className="bg-orange-200 rounded-md px-4 py-2 mt-4"
        onClick={fileUploadHandler}
        disabled={isLoading}
      >
        Loop!
      </button>
      {isLoading && <CircularProgress className="m-4" />}
      {isLoading ? 'Looping in progress. please wait...' : ''}
      {downloadUrl != null &&
        <div className="bg-neutral-200 rounded-md p-4 m-4 hover:bg-neutral-400">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download looped file</a>
        </div>
      }
      <p className="2xl items-center">Note: processing may take a while due to server performance.</p>
      <p>Typically takes 25% of the selected duration to process</p>
    </div>
  )
}
