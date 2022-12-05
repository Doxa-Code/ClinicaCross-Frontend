import React, { useEffect } from 'react'

export default function Modal({
  children,
  open = false,
  setOpen = () => {},
  closeWithEsc = false,
  className = '',
  classNameModal = ''
}) {
  useEffect(() => {
    closeWithEsc &&
      document.addEventListener('keydown', ({ key }) =>
        closeWithEsc ? key === 'Escape' && setOpen(false) : null
      )
  }, [closeWithEsc])

  return (
    <div
      className={`w-full min-h-screen overflow-auto bg-black bg-opacity-50 ${
        open ? 'grid' : 'hidden'
      } ${className} top-0 left-0 flex px-3 justify-center items-center fixed w-full`}
    >
      <div
        className={`bg-white animate-open-modal transition-opacity w-full sm:max-w-md p-2 xl:px-2  xl:max-w-6xl  rounded-md  max-h-[750px]  flex flex-col justify-start items-center gap-5 ${classNameModal}`}
      >
        {open ? children : null}
      </div>
    </div>
  )
}
