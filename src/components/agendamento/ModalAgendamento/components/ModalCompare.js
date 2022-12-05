/* eslint-disable handle-callback-err */
import Modal from '../../../Modal'
import * as Icons from 'react-icons/md'
import { useAnexoStore } from '../../../../hooks/store'
import 'react-circular-progressbar/dist/styles.css'

export default function ModalCompare() {
  const {
    showCompareAnexo,
    setShowCompareAnexo,
    compareFiles,
    setCompareFiles
  } = useAnexoStore(state => state)

  return (
    <Modal
      closeWithEsc
      open={showCompareAnexo}
      setOpen={() => {
        setShowCompareAnexo(false)
        setCompareFiles([])
      }}
    >
      <div className="bg-white w-full max-w-5xl rounded-xl justify-center items-end">
        <div className="flex justify-end items-center p-5 rounded-t-xl text-slate-500 border-b border-slate-500">
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => {
              setShowCompareAnexo(!showCompareAnexo)
              setCompareFiles([])
            }}
          />
        </div>
        <div className="grid grid-cols-2 justify-center items-center h-screen max-h-96">
          <img
            src={compareFiles[0]?.data}
            className="object-cover p-2"
            onError={e => (e.target.src = '/image/favicon-2.png')}
          />
          <img
            src={compareFiles[1]?.data}
            className="object-cover p-2"
            onError={e => (e.target.src = '/image/favicon-2.png')}
          />
        </div>
      </div>
    </Modal>
  )
}
