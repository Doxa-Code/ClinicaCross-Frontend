/* eslint-disable indent */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as Icons from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue,
  setFieldsValue,
  debounceEvent
} from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import { consultarCep } from 'correios-brasil'
import { Input, InputFormat, Header } from '../../components/Form'
import { useDropzone } from 'react-dropzone'
import { useFetch } from '../../hooks/useFetch'
import { differenceInYears, isValid, parseISO } from 'date-fns'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export default function PacientesCadastro({
  paciente = {},
  modal = false,
  cancelFunction,
  successFunction
}) {
  const { replace, events } = useRouter()
  const { create, update } = useFetch()
  const [loading, setLoading] = useState(false)
  const [idade, setIdade] = useState(0)
  const [preview, setPreview] = useState('/image/user.png')
  const [progress, setProgress] = useState(0)
  const [openCam, setOpenCam] = useState(false)
  const [fileTmp, setFileTmp] = useState()

  const printableAreaRef = useRef(null)

  const handlePrintClick = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor('#33425E')
    doc.text('Ficha de Paciente', 80, 20)
    doc.text('#', 10, 20)
    doc.text(paciente.codigo || '', 16, 20)
    doc.setFontSize(15)
    doc.setTextColor('#2A2C33')
    doc.text('Nome:', 10, 40)
    doc.setTextColor('#353C54')
    doc.text(paciente.nome || '', 30, 40)
    doc.setTextColor('#2A2C33')
    doc.text('CPF:', 10, 50)
    doc.setTextColor('#353C54')
    doc.text(paciente.cpf || '', 30, 50)
    doc.setTextColor('#2A2C33')
    doc.text('RG:', 10, 60)
    doc.setTextColor('#353C54')
    doc.text(paciente.rg || '', 30, 60)
    doc.setTextColor('#2A2C33')
    doc.text('Data de nascimento:', 10, 70)
    doc.setTextColor('#353C54')
    doc.text(
      format(parseISO(paciente.dataNascimento || ''), 'dd/MM/yyyy'),
      65,
      70
    )
    doc.setTextColor('#2A2C33')
    doc.text('CNS:', 10, 80)
    doc.setTextColor('#353C54')
    doc.text(paciente.cns || '', 30, 80)
    doc.setTextColor('#2A2C33')
    doc.text('Identificador:', 10, 90)
    doc.setTextColor('#353C54')
    doc.text(paciente.identificador || '', 50, 90)
    doc.setTextColor('#2A2C33')
    doc.text('Whatsapp:', 10, 100)
    doc.setTextColor('#353C54')
    doc.text(paciente.whatsapp || '', 50, 100)
    doc.setTextColor('#2A2C33')
    doc.text('Telefone de contato:', 10, 110)
    doc.setTextColor('#353C54')
    doc.text(paciente.telefone || '', 65, 110)
    doc.setFontSize(20)
    doc.setTextColor('#33425E')
    doc.text('Endereço', 80, 130)
    doc.setFontSize(15)
    doc.setTextColor('#2A2C33')
    doc.text('Logradouro:', 10, 150)
    doc.setTextColor('#353C54')
    doc.text(paciente.rua || '', 50, 150)
    doc.setTextColor('#2A2C33')
    doc.text('Numero:', 10, 160)
    doc.setTextColor('#353C54')
    doc.text(paciente.numero || '', 50, 160)
    doc.setTextColor('#2A2C33')
    doc.text('Bairro:', 10, 170)
    doc.setTextColor('#353C54')
    doc.text(paciente.bairro || '', 50, 170)
    doc.setTextColor('#2A2C33')
    doc.text('Complemento:', 10, 180)
    doc.setTextColor('#353C54')
    doc.text(paciente.complemento || '', 50, 180)
    doc.setTextColor('#2A2C33')
    doc.text('CEP:', 10, 190)
    doc.setTextColor('#353C54')
    doc.text(paciente.cep || '', 50, 190)
    doc.setTextColor('#2A2C33')
    doc.text('Cidade:', 10, 200)
    doc.setTextColor('#353C54')
    doc.text(paciente.cidade || '', 50, 200)
    doc.setTextColor('#2A2C33')
    doc.text('UF:', 10, 210)
    doc.setTextColor('#353C54')
    doc.text(paciente.uf || '', 50, 210)
    window.open(doc.output('bloburi'))
  }

  const video = useRef(null)

  const onDrop = useCallback(async acceptedFiles => {
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = event => {
      setPreview(event.target.result)
    }
    reader.readAsDataURL(file)
    setFileTmp(file)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop
  })

  useEffect(() => {
    if (Object.keys(paciente).length > 0) {
      calculateAge(paciente.dataNascimento)
      setFieldsValue(paciente)
      setPreview(paciente.thumbnail || '/image/user.png')
    }
  }, [paciente])

  useEffect(() => {
    events.on('routeChangeStart', () => {
      const tracks = video.current?.srcObject?.getTracks()
      if (tracks) {
        tracks.map(track => track.stop())
      }
    })
  }, [])

  const calculateAge = value => {
    const date = parseISO(value)
    const valid = isValid(date)
    if (!valid) return setIdade(0)
    setIdade(differenceInYears(new Date(), date))
  }

  async function handleUpload(file, paciente) {
    const formData = new FormData()
    formData.append('thumbnail', file)
    // eslint-disable-next-line no-unused-vars
    const [response, error] = paciente._id
      ? await update(`/pacientes/${paciente._id}`, formData, {
          headers: {
            'Content-Type': `multipart/form-data; boundary: ${file._boundary}`
          },
          onUploadProgress: ({ loaded, total }) =>
            setProgress((loaded * 100) / total)
        })
      : await create('/pacientes', formData, {
          headers: {
            'Content-Type': `multipart/form-data; boundary: ${file?._boundary}`
          },
          onUploadProgress: ({ loaded, total }) =>
            setProgress((loaded * 100) / total)
        })

    if (error) return
    setProgress(0)
  }

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const body = getFieldsValue(e)

    // eslint-disable-next-line no-unused-vars
    const [response, error] = paciente._id
      ? await update(`/pacientes/${paciente._id}`, body)
      : await create('/pacientes', body)

    if (error) return
    if (fileTmp) {
      await handleUpload(fileTmp, response)
    }
    if (successFunction) {
      return successFunction(
        paciente._id
          ? {
              ...paciente,
              ...body
            }
          : response
      )
    }

    swal('Sucesso!', ' ', 'success', {
      timer: 1000,
      buttons: false
    })
    replace('/pacientes')
  }

  function hadleOpenCamera() {
    setOpenCam(true)
    video.current.setAttribute('autoplay', '')
    video.current.setAttribute('muted', '')
    video.current.setAttribute('playsinline', '')
    navigator.getUserMedia(
      { video: {} },
      stream => {
        video.current.srcObject = stream
      },
      err => {
        console.error(err)
        setOpenCam(false)
      }
    )
  }

  async function handleTakeAPicture() {
    const canvas = document.createElement('canvas')
    canvas.width = video.current.videoWidth
    canvas.height = video.current.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video.current, 0, 0, canvas.width, canvas.height)

    const dataURI = canvas.toDataURL('image/jpeg')
    setPreview(dataURI)

    canvas.toBlob(
      blob => {
        setFileTmp(blob)
      },
      'image/jpeg',
      100
    )
    setOpenCam(false)
  }

  return (
    <Menu modal={modal} stateLoading={loading} title="Cadastro de pacientes">
      <form className="px-5 xl:px-10 py-5" onSubmit={handleSubmit}>
        <div ref={printableAreaRef}>
          <div className="py-5 flex flex-col xl:grid xl:grid-cols-3 gap-4">
            <Header className="col-span-3">Dados pessoais</Header>
            <div className="flex flex-col items-center gap-4 justify-center">
              <div
                className="w-60 h-60 max-h-60 cursor-pointer rounded-full flex justify-center items-center"
                title="Mudar foto"
                {...(!openCam ? getRootProps() : {})}
              >
                <input {...getInputProps()} accept="image/*" />
                <video
                  className={`w-60 h-60 object-cover rounded-full border z-50 ${
                    !openCam && 'hidden'
                  }`}
                  ref={video}
                />
                <img
                  src={preview}
                  className={`object-cover w-60 h-60  max-h-60 rounded-full ${
                    openCam && 'hidden'
                  }`}
                />
              </div>
              <div className="flex flex-col items-center gap-2 mt-2 justify-center">
                {progress > 0 && (
                  <div className="w-52 bg-gray-100 rounded-md">
                    <div
                      className="flex pl-1 h-1 bg-primary text-white justify-center rounded-md"
                      style={{
                        width: `${progress}%`
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                {!openCam && (
                  <button
                    type="button"
                    onClick={() => hadleOpenCamera()}
                    className="bg-primary text-white p-2 px-3 rounded-md flex justify-center items-center gap-4"
                  >
                    <Icons.FaCamera />
                    Abrir WebCam
                  </button>
                )}
                {openCam && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTakeAPicture()}
                      className="bg-teal-500 text-white p-2 px-3 rounded-md flex justify-center items-center gap-4"
                    >
                      <Icons.FaCamera />
                      Tirar foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenCam(false)}
                      className="bg-red-500 text-white p-2 px-3 rounded-md flex justify-center items-center gap-4"
                    >
                      <Icons.FaTimes />
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 flex flex-col xl:grid xl:grid-cols-3 gap-4">
              <Input title="Código do paciente" name="codigo" />
              <Input title="Nome" required name="nome" className="col-span-2" />
              <InputFormat pattern="###.###.###-##" title="CPF" name="cpf" 
                defaultValue={paciente?.cpf}/>
              <Input title="RG" name="rg" />
              <div>
                <Input
                  title="Data de nascimento"
                  name="dataNascimento"
                  type="date"
                  required
                  onChange={e => calculateAge(e.target.value)}
                />
                <div className="pt-2 flex justify-end items-center">
                  <span className="text-gray-600 text-sm">
                    {idade}
                    {idade === 1 ? ' ano' : ' anos'}
                  </span>
                </div>
              </div>
              <Input title="Número da carteirinha" name="numeroCarteira" />
              <Input title="CNS" name="cns" />
              <Input title="Identificador" name="identificador" />
              <InputFormat
                pattern="## # #### ####"
                title="Whatsapp"
                name="whatsapp"
                defaultValue={paciente.whatsapp}
              />
              <Input
                type="number"
                title="Telefone de contato"
                name="telefone"
              />
              <Input
                title="E-mail"
                name="email"
              />
              <Input
                title="Responsável"
                name="responsavel"
              />
            </div>

            <Header className="col-span-3 mt-10">Endereço</Header>
            <InputFormat
              title="CEP"
              name="cep"
              pattern="########"
              type="number"
              defaultValue={paciente.cep}
              onChange={debounceEvent(async value => {
                if (!value) return
                try {
                  const endereco = await consultarCep(value)
                  const keyMutation = {
                    logradouro: 'rua',
                    localidade: 'cidade',
                    uf: 'uf',
                    complemento: 'complemento',
                    bairro: 'bairro'
                  }
                  const body = Object.keys(keyMutation).reduce((body, key) => {
                    if (!endereco[key]) return body
                    body[keyMutation[key] || key] = endereco[key]
                    return body
                  }, {})
                  setFieldsValue(body)
                } catch (e) {
                  console.log(e)
                }
              }, 1000)}
            />
            <Input title="Logradouro" name="rua" className="col-span-2" />
            <Input title="Número" name="numero" />
            <Input title="Bairro" name="bairro" />
            <Input title="Complemento" name="complemento" />
            <Input title="Cidade" name="cidade" className="col-span-2" />
            <Input title="UF" name="uf" />
          </div>
        </div>
        <div className="flex w-full sm:flex-row flex-col justify-end py-7 gap-3">
          <button
            type="button"
            onClick={handlePrintClick}
            className={`flex bg-amber-600 justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm ${
              !paciente._id && 'hidden'
            }`}
          >
            <Icons.FaPrint size={16} />
            Ficha do Paciente
          </button>
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaCheck size={16} />
            {paciente._id ? 'Atualizar' : 'Cadastrar'}
          </button>
          <button
            type="button"
            onClick={() =>
              cancelFunction ? cancelFunction() : replace('/pacientes')
            }
            className="flex bg-red-700 justify-center items-center py-2 text-white gap-3 px-5 rounded-md text-sm"
          >
            <Icons.FaTimes size={16} />
            Cancelar
          </button>
        </div>
      </form>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const { id } = ctx.query
    if (!id) {
      return {
        props: {
          paciente: {}
        }
      }
    }
    const response = await api.get(`/pacientes/${id}`)

    return {
      props: {
        paciente: response.data
      }
    }
  } catch (err) {
    console.log(err)
  }
}
