/* eslint-disable indent */
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { createLogger } from '../hooks/store'

export default function notFound({ statusCode }) {
  const logger = createLogger()
  const router = useRouter()
  useEffect(() => {
    logger.error(`Error Page ${statusCode}`, {
      module: '_error.js',
      body: {
        statusCode,
        ...router
      }
    })
  }, [statusCode])
  return (
    <div className="bg-image w-full h-screen ">
      <div className="w-full flex flex-col gap-4 items-center justify-center h-screen bg-secondary bg-opacity-80">
        <img src="/favicon.ico" className="w-80 transform rotate-45" />
        <h1 className="text-5xl text-white font-semibold">Ops!</h1>
        <div className="flex flex-col text-center gap-2">
          <span className="text-3xl font-light text-white italic">
            Página não encontrada!
          </span>
          <Link href="/">
            <span className="italic cursor-pointer font-bold text-white rounded-full">
              Clique aqui para voltar ao inicio
            </span>
          </Link>
          <span className="text-sm font-light text-white">
            Código do erro: {statusCode}
          </span>
        </div>
      </div>
    </div>
  )
}

notFound.getInitialProps = async ({ res }) => {
  return { statusCode: res.statusCode }
}
