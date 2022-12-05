/* eslint-disable handle-callback-err */
import Modal from '../../../Modal'
import * as Icons from 'react-icons/md'
import { useState, useCallback, useEffect } from 'react'
import {
  useAnexoStore,
  useAgendamentoStore,
  usePayloadStore
} from '../../../../hooks/store'
import { useFetch } from '../../../../hooks/useFetch'
import { useDropzone } from 'react-dropzone'
import { api } from '../../../../services/api'
import { CircularProgressbar } from 'react-circular-progressbar'
import filesize from 'filesize'
import { uniqueId } from 'lodash'
import 'react-circular-progressbar/dist/styles.css'

export default function ModalAnexo() {
  const { fetch } = useFetch()
  const { showAnexo, setShowAnexo } = useAnexoStore(state => state)
  const { agendamento, setAgendamento } = useAgendamentoStore(state => state)
  const { payload } = usePayloadStore(state => state)

  const [uploadedFiles, setUploadedFiles] = useState([])

  useEffect(() => {
    if (showAnexo) {
      setUploadedFiles([])
    }
  }, [showAnexo])

  const onDrop = useCallback(async acceptedFiles => {
    const files = acceptedFiles.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      progress: 0,
      uploaded: false,
      error: false
    }))

    setUploadedFiles(state => state.concat(files))
    files.forEach(processUpload)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop
  })

  const updateFile = useCallback((id, data) => {
    setUploadedFiles(state =>
      state.map(file => (file.id === id ? { ...file, ...data } : file))
    )
  }, [])

  const processUpload = useCallback(
    uploadedFile => {
      const data = new FormData()

      if (uploadedFile.file) {
        data.append('anexo', uploadedFile.file, uploadedFile.name)
        data.append('nome', uploadedFile.name)
        data.append('responsavel', payload._id)
      }

      api
        .post(`/pacientes/anexo/${agendamento.paciente._id}`, data, {
          onUploadProgress: progressEvent => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )

            updateFile(uploadedFile.id, { progress })
          }
        })
        .then(async () => {
          const [data] = await fetch(`/agendamentos/${agendamento._id}`)
          setAgendamento(data)
          updateFile(uploadedFile.id, { uploaded: true })
        })
        .catch(() =>
          updateFile(uploadedFile.id, {
            error: true
          })
        )
    },
    [updateFile]
  )

  return (
    <Modal closeWithEsc open={showAnexo} setOpen={setShowAnexo}>
      <div className="bg-white w-full max-w-5xl rounded-xl justify-center items-end">
        <div className="flex justify-between items-center p-5 rounded-t-xl text-slate-500 border-b border-slate-500">
          <span className="text-2xl font-semibold">Novo Anexo</span>
          <Icons.MdClose
            size={20}
            className="cursor-pointer"
            onClick={() => setShowAnexo(false)}
          />
        </div>
        <div className="p-5">
          <div
            className="w-full h-60 max-h-60 outline-none border-2 border-dashed cursor-pointer rounded-md flex justify-center items-center"
            {...getRootProps()}
          >
            <input {...getInputProps()} className="outline-none" />
            <span className="text-slate-400 italic">
              Clique ou Arraste o seu arquivo aqui
            </span>
          </div>
        </div>
        <ul className="w-full bg-gray-100 grid gap-4 max-h-60 overflow-auto p-5">
          {uploadedFiles.map((file, index) => {
            return (
              <li key={index} className="w-full">
                <div className="w-full bg-white  flex justify-between items-center px-5 py-4 rounded-md shadow-md">
                  <div className="grid">
                    <span className="font-semibold text-zinc-700">
                      {file.name || '-'}
                    </span>
                    <div className="flex gap-1 text-xs text-gray-500">
                      <span>{file.readableSize || '0.0 kb'}</span>
                    </div>
                  </div>
                  <div>
                    {file.uploaded ? (
                      <Icons.MdCheckCircle
                        size={20}
                        className="text-green-500 h-9 w-9"
                      />
                    ) : file.error ? (
                      <Icons.MdError
                        size={20}
                        className="text-red-500 h-9 w-9"
                      />
                    ) : (
                      <CircularProgressbar
                        value={file.progress}
                        text={`${file.progress}%`}
                        className="h-9 w-9"
                      />
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Modal>
  )
}
