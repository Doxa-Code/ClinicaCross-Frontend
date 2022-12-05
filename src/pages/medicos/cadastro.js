import { useState, useEffect } from 'react'
import * as Icons from 'react-icons/fa'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue,
  setFieldsValue
} from '../../utils'
import { useRouter } from 'next/router'
import swal from '@sweetalert/with-react'
import {
  CheckBoxList,
  Input,
  Select,
  SelectSearch,
  Span,
  ToggleButton
} from '../../components/Form'
import {
  cbosANS,
  conselhoProfissionalANS,
  unidadeFederativaANS
} from '../../data'
import { useRef } from 'react'
import { useAgendamentoStore } from '../../hooks/store'

export default function MedicosCadastro({ medico = {} }) {
  const { replace } = useRouter()
  const [loading, setLoading] = useState(false)
  const [diasDaSemana, setDiasDaSemana] = useState([])
  const selectUFRef = useRef()
  const selectConselhoProfissionalRef = useRef()
  const selectCBOSRef = useRef()
  const { configuracoes } = useAgendamentoStore()

  useEffect(() => {
    if (Object.keys(medico).length > 0) {
      setFieldsValue(medico)
      selectUFRef.current.setValue(
        unidadeFederativaANS.filter(uf => uf.value === medico.UF)
      )
      selectConselhoProfissionalRef.current.setValue(
        conselhoProfissionalANS.filter(
          uf => uf.value === medico.conselhoProfissional
        )
      )
      selectCBOSRef.current.setValue(
        cbosANS.filter(cbo => cbo.value === medico.cbos)
      )
    }
  }, [medico])

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const body = getFieldsValue(e)
    body.shortSchedule = body.shortSchedule === 'false'
    try {
      const update = Object.keys(medico).length > 0
      const response = await api({
        url: update ? `/medicos/${medico._id}` : '/medicos',
        method: update ? 'put' : 'post',
        data: {
          ...medico,
          ...body,
          diasDaSemana
        }
      })
      if (!response) {
        throw new Error(
          'Houve um erro ao tentar cadastrar! tente novamente mais tarde!'
        )
      }

      swal('Sucesso!', ' ', 'success', {
        timer: 1000,
        buttons: false
      })

      replace('/medicos')
    } catch (err) {
      setLoading(false)
      if (err.response) {
        return swal('Espere', `${err.response.data}`, 'error')
      }
      swal('Espere!', `${err.message}`, 'error')
    }
  }

  return (
    <Menu stateLoading={loading} title="Cadastro de médicos">
      <form className="px-5 xl:px-10 py-5" onSubmit={handleSubmit}>
        <div>
          <div className="py-5 flex flex-col xl:grid xl:grid-cols-4 gap-4">
            <Select name="sigla" title="Tipo de tratamento">
              <option value="">Nenhum</option>
              <option value="Dr.">Doutor - Dr.</option>
              <option value="Dra.">Doutora - Dra.</option>
            </Select>
            <Input name="nome" required title="Nome" className="col-span-2" />
            <SelectSearch
              title="Unidade Federativa"
              isClearable
              name="UF"
              setRef={ref => (selectUFRef.current = ref)}
              placeholder="Selecione!"
              options={unidadeFederativaANS}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
            <Input name="codigo" title="Código do médico" />
            <SelectSearch
              title="Conselho Profissional"
              isClearable
              name="conselhoProfissional"
              setRef={ref => (selectConselhoProfissionalRef.current = ref)}
              placeholder="Selecione!"
              options={conselhoProfissionalANS}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
            <Input
              name="numeroConselhoProfissional"
              required
              title="Numero do conselho profissional"
            />
            <Input name="especialidade" title="Especialidade" />

            <SelectSearch
              title="CBOS"
              isClearable
              name="cbos"
              setRef={ref => (selectCBOSRef.current = ref)}
              placeholder="Selecione!"
              options={cbosANS}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
            <Input
              name="bloco"
              title="Intervalo de Atendimento"
              type="number"
              defaultValue={medico.bloco || configuracoes.bloco || 15}
            />
            <div className="grid gap-1 col-span-2">
              <div className="relative overflow-hidden w-full xl:w-[90px] h-[50px] border rounded-md">
                <input
                  name="cor"
                  type="color"
                  defaultValue={medico.cor || '#353535'}
                  className="absolute -right-1 -top-2 w-full xl:w-[106px] h-[106px] border-none"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Span>Agenda curta?</Span>
              <ToggleButton
                defaultValue={medico.shortSchedule}
                name="shortSchedule"
              />
            </div>
            <div className="grid col-span-4 gap-2">
              <span className="text-primary ">Dias da semana</span>
              <CheckBoxList
                preSelect={medico.diasDaSemana || [0, 1, 2, 3, 4, 5, 6]}
                onSelected={setDiasDaSemana}
                grid={7}
                className="col-span-4 grid-cols-7"
                list={[
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Segunda'
                  },
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Terça'
                  },
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Quarta'
                  },
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Quinta'
                  },
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Sexta'
                  },
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Sábado'
                  },
                  {
                    bg: 'bg-gray-400',
                    color: 'text-gray-100',
                    title: 'Domingo'
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex xl:flex-row flex-col justify-end py-7 gap-3">
          <button className="flex bg-primary justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm">
            <Icons.FaCheck size={16} />
            {Object.keys(medico).length > 0 ? 'Alterar' : 'Cadastrar'}
          </button>
          <button
            type="button"
            onClick={() => replace('/medicos')}
            className="flex bg-red-700 justify-center items-center text-white gap-3 px-5 py-2 rounded-md text-sm"
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
    const convenios = await api.get(`/convenios`)
    const medico = id
      ? await api.get(`/medicos/${id}`).then(response => response.data)
      : {}
    return {
      props: {
        medico,
        convenios: convenios.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {
        medico: {}
      }
    }
  }
}
