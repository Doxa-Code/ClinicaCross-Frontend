/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react'
import * as Icons from 'react-icons/fa'
import { RiEyeCloseFill, RiEyeFill } from 'react-icons/ri'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { usePayloadStore, useMenuStore } from '../../hooks/store'
import { formatMoney } from '../../utils'
import { menuData } from '../../data'

export default function Menu({
  children,
  title = 'Titulo',
  className = 'rounded-2xl bg-white',
  withBreadcumbs = true,
  modal = false
}) {
  const { pathname, events } = useRouter()
  const [breadcumbs, setBreadcumbs] = useState({})
  const [openMenu, setOpenMenu] = useState(false)
  const [showCaixa, setShowCaixa] = useState(false)
  const [openAcordion, setOpenAcordion] = useState('')
  const [nome, setNome] = useState('Cliente')
  const [menu, setMenu] = useState([])
  const [valor, setValor] = useState(0)
  const { payload } = usePayloadStore(state => state)
  const { stateLoading, setStateLoading } = useMenuStore(state => state)

  useEffect(() => {
    events.on('routeChangeStart', () => setStateLoading(true))
    events.on('routeChangeComplete', () => setStateLoading(false))
    events.on('routeChangeError', () => setStateLoading(false))

    return () => {
      events.off('routeChangeStart')
      events.off('routeChangeComplete')
      events.off('routeChangeError')
    }
  }, [])

  useEffect(() => {
    const menuArgs = menuData.filter(item => {
      if (payload.developer) return true
      if (item.multi) {
        item.childrens = item.childrens.filter(item =>
          payload?.grupo?.acessos?.includes(item.title)
        )
        return item
      }
      return payload?.grupo?.acessos?.includes(item.title)
    })
    const url = pathname.split('/')
    const menuSelect = menuArgs.find(item => item?.active(url[1]))

    const menuIsAccordion = menuArgs.find(item => item.active(url[1]))

    if (menuIsAccordion?.multi) {
      setOpenAcordion(menuIsAccordion.title)
    }
    setBreadcumbs({
      icon: menuSelect ? menuSelect.icon : false,
      paths: url
        .filter(item => item)
        .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    })
    setMenu(menuArgs)
    setValor(payload.valor || 0)
    setNome(payload?.nome || 'Cliente')
  }, [payload])

  function renderMenuMulti(item, key) {
    const avaible =
      payload.adm || payload.developer
        ? true
        : item.childrens?.some(children =>
            payload.grupo?.acessos?.includes(children.title)
          )
    return (
      <div
        className={!avaible && 'hidden'}
        onClick={() =>
          setOpenAcordion(openAcordion !== item.title && item.title)
        }
      >
        <div
          key={key}
          className="bg-secondary bg-opacity-0 mb-1  gap-3 px-5 py-2 flex justify-between items-center cursor-pointer hover:bg-black hover:bg-opacity-10"
        >
          <div className="flex justify-center items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded">
              {Icons[
                (openAcordion === item.title && item.iconOpen
                  ? item.iconOpen
                  : item.icon) || 'FaBars'
              ]({
                size: 18,
                className: 'text-white'
              })}
            </div>
            <span className="text-gray-300 text-sm">{item.title}</span>
          </div>
          {openAcordion === item.title ? (
            <Icons.FaChevronDown className="text-white opacity-60" size={12} />
          ) : (
            <Icons.FaChevronRight className="text-white opacity-60" size={12} />
          )}
        </div>
        <div
          className={`bg-black bg-opacity-20 ${
            openAcordion !== item.title && 'hidden'
          }`}
        >
          {item.childrens?.map((children, key) => (
            <Link href={children.route} key={key}>
              <div
                key={key}
                className={`pl-10 mb-1 gap-3 py-4 flex justify-start items-center cursor-pointer hover:bg-white hover:bg-opacity-10 ${
                  children.active(pathname.split('/')[1])
                    ? 'bg-white bg-opacity-20'
                    : 'bg-secondary bg-opacity-0'
                }`}
              >
                <div className="bg-white bg-opacity-20 p-2 rounded"></div>
                <span className="text-gray-300 text-xs">{children.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  function renderMenu(item, key) {
    if (item.active(pathname.split('/')[1])) {
      return (
        <div
          key={key}
          className="bg-opacity-30 mb-1 snap-start bg-black gap-3 flex justify-start pl-5 py-2 items-center cursor-pointer"
        >
          <Link href={item.route}>
            <>
              <div className="bg-white bg-opacity-20 p-2 rounded">
                {Icons[item.icon]({
                  size: 18,
                  className: 'text-white'
                })}
              </div>
              <span className=" text-white text-sm">{item.title}</span>
            </>
          </Link>
        </div>
      )
    }
    return (
      <Link href={item.route} key={key}>
        <div className="bg-secondary bg-opacity-0 mb-1  gap-3 pl-5 py-2 flex justify-start items-center cursor-pointer hover:bg-black hover:bg-opacity-10">
          <div className="bg-white bg-opacity-20 p-2 rounded">
            {Icons[item.icon]({
              size: 18,
              className: 'text-white'
            })}
          </div>
          <span className="text-gray-300 text-sm">{item.title}</span>
        </div>
      </Link>
    )
  }

  if (modal) {
    return children
  }

  return (
    <>
      {/* LOADING */}
      <div
        className={`fixed z-10 h-full  w-full flex-col gap-3 justify-center items-center bg-secondary bg-opacity-90 ${
          !stateLoading ? 'hidden' : 'flex'
        }`}
      >
        <img src="/favicon.ico" className="w-28 animate-bounce" />
        <span className="text-white text-md bg-black bg-opacity-30 px-4 py-2 rounded-full animate-pulse">
          Carregando...
        </span>
      </div>
      <div className="w-full bg-gray-200 flex flex-col xl:grid grid-cols-content">
        {/* RESPONSIVE MENU */}
        <div className="bg-secondary z-10 justify-between items-center flex w-full xl:hidden">
          <div className="py-4 bg-black bg-opacity-20 flex  gap-3 justify-start px-5 items-center">
            <img src="/image/logo.png" className="w-24" />
          </div>
          <div
            className="p-3 bg-black bg-opacity-10"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <Icons.FaBars size={30} className="text-white" />
          </div>
        </div>
        <div
          className={`bg-secondary z-0 transition duration-300 transform ${
            !openMenu && 'transition duration-300 -translate-y-[680px] '
          }`}
        >
          <div className="bg-black cursor-pointer hover:shadow-xl bg-opacity-10 p-5 gap-2 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80 text-zinc-50">Meu caixa</span>
              {showCaixa ? (
                <RiEyeFill
                  onClick={() => setShowCaixa(false)}
                  className="text-white"
                  size={20}
                />
              ) : (
                <RiEyeCloseFill
                  onClick={() => setShowCaixa(true)}
                  className="text-white"
                  size={20}
                />
              )}
            </div>
            <Link href="/caixa">
              <span className="text-3xl truncate text-white">
                {showCaixa ? formatMoney(valor) : 'R$ - '}
              </span>
            </Link>
          </div>
          <div className="bg-black bg-opacity-10 mx-3 p-3 ">
            {menu.map((item, key) => {
              if (item.multi) {
                return renderMenuMulti(item, key)
              }
              return renderMenu(item, key)
            })}
          </div>
        </div>
        {/* MENU */}
        <div className="bg-image bg-center hidden xl:flex flex-col fixed w-full shadow-2xl max-w-content">
          <div className="h-screen overflow-auto scrollbar bg-secondary bg-opacity-90">
            <div className="p-4 mb-3 bg-opacity-20 flex gap-3 bg-black justify-center items-center">
              <img src="/image/logo.png" className="w-44" />
            </div>

            <div className="bg-black bg-opacity-20 p-4 flex gap-3 justify-start items-center">
              <div className="bg-white rounded-full p-3 flex justify-center items-center">
                <Icons.FaUser size={20} className="text-gray-light" />
              </div>
              <span className="text-white text-xs flex flex-col">
                Bem vindo, <b className="text-lg">{nome}</b>
              </span>
            </div>

            <div className="bg-black cursor-pointer hover:shadow-xl bg-opacity-10 px-5 py-3 gap-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80 text-zinc-50">
                  Meu caixa
                </span>
                {showCaixa ? (
                  <RiEyeFill
                    onClick={() => setShowCaixa(false)}
                    className="text-white"
                    size={20}
                  />
                ) : (
                  <RiEyeCloseFill
                    onClick={() => setShowCaixa(true)}
                    className="text-white"
                    size={20}
                  />
                )}
              </div>
              <Link href="/caixa">
                <span className="text-2xl truncate text-white">
                  {showCaixa ? formatMoney(valor) : 'R$ - '}
                </span>
              </Link>
            </div>

            <div className="overflow-auto snap-always snap-mandatory snap-y grid">
              {menu.map((item, key) => {
                if (item.multi) {
                  return renderMenuMulti(item, key)
                }
                return renderMenu(item, key)
              })}
              <Link href="/">
                <div className=" mb-1  gap-3 pl-5 py-2 flex justify-start items-center cursor-pointer hover:bg-red-900 hover:bg-opacity-90">
                  <div className="bg-white bg-opacity-20 p-2 rounded">
                    {Icons.FaArrowRight({
                      size: 18,
                      className: 'text-white'
                    })}
                  </div>
                  <span className="text-gray-300 text-sm">Sair</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        {/* CONTENT */}
        <div
          className={`flex flex-col col-start-2 min-h-screen flex-1 xl:px-10 pt-10 gap-6 xl:translate-y-0 transition duration-300 transform ${
            !openMenu && 'transition duration-300 -translate-y-[630px] '
          }`}
        >
          <div className="w-full flex flex-col items-start px-10 xl:px-0 gap-2 justify-between">
            <h1
              className="font-normal text-3xl truncate w-full border-gray-800 text-gray-light"
              testd="titulo"
            >
              {title}
            </h1>
            <div
              className={`flex justify-start w-full truncate items-center gap-3 ${
                !withBreadcumbs && 'hidden'
              }`}
            >
              <ul className="flex justify-center  items-center bg-gray-300 bg-opacity-60 text-sm text-gray-500 gap-1 px-4 py-2 rounded-full">
                <li className="flex justify-center  items-center gap-1">
                  {breadcumbs.icon && Icons[breadcumbs.icon]({ size: 16 })}
                  <Icons.FaChevronRight size={11} className="opacity-80" />
                </li>
                {breadcumbs.paths &&
                  breadcumbs.paths.map((item, key) => {
                    return (
                      <li
                        className="flex justify-center  items-center gap-1"
                        key={key}
                      >
                        <span className="truncate ">{item}</span>
                        {breadcumbs.paths.length - 1 !== key && (
                          <Icons.FaChevronRight
                            size={11}
                            className="opacity-80"
                          />
                        )}
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
          <div className={`flex-1 mb-10 ${className}`}>{children}</div>
        </div>
      </div>
      <div className="bg-primary w-full h-14 "></div>
    </>
  )
}
