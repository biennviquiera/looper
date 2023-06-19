import Image from 'next/image'
import Layout from './layout'
import './globals.css'

export default function Home() {
  return (
    <Layout className="bg-neutral-400 min-h-screen">
      <h1 className="flex justify-center font-bold py-20 text-4xl">Looper</h1>
    </Layout>
  )
}
