/* eslint-disable indent */
import Link from 'next/link'

export default function notFound({ dataInitial = [] }) {
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
        </div>
      </div>
    </div>
  )
}
