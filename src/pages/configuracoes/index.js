import { useState, useEffect, useRef } from 'react'
import Menu from '../../components/Menu'
import { api } from '../../services/api'
import {
  getCookie,
  returnPage,
  getFieldsValue,
  setFieldsValue,
  debounceEvent
} from '../../utils'
import swal from '@sweetalert/with-react'
import {
  Header,
  Item,
  Input,
  Button,
  SelectSearch,
  InputFormat
} from '../../components/Form'
import { tipoLogradouro, UF } from '../../data'
import { consultarCep } from 'correios-brasil'

export default function ConfiguracaoCadastro({ configuracao = {} }) {
  const [loading, setLoading] = useState(false)
  const selectTipoLogradouroRef = useRef()
  const selectUFRef = useRef()

  useEffect(() => {
    if (Object.keys(configuracao).length > 0) {
      setFieldsValue({
        bloco: configuracao.bloco || 15,
        inicio: configuracao.inicio || '08:00',
        fim: configuracao.fim || '19:00',
        ...configuracao
      })
      selectTipoLogradouroRef.current.setValue(
        tipoLogradouro.filter(tl => tl.value === configuracao.tipoLogradouro)
      )
      selectUFRef.current.setValue(
        UF.filter(uf => uf.value === configuracao.uf)
      )
    }
  }, [configuracao])

  async function handleSubmit(e) {
    setLoading(true)
    e.preventDefault()
    const body = getFieldsValue(e)
    try {
      const response = await api({
        url: '/configuracoes',
        method: 'post',
        data: {
          ...configuracao,
          ...body
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
      setLoading(false)
    } catch (err) {
      setLoading(false)
      if (err.response) {
        return swal('Espere', `${err.response.data}`, 'error')
      }
      swal('Espere!', `${err.message}`, 'error')
    }
  }

  return (
    <Menu stateLoading={loading} title="Configurações" className="grid gap-4">
      <form className="p-10 rounded-2xl bg-white" onSubmit={handleSubmit}>
        <div>
          <Header className="grid gap-4">Agenda</Header>
          <div className="py-5 flex flex-col xl:grid xl:grid-cols-3 gap-4">
            <Input
              title="Intervalo de Atendimento"
              name="bloco"
              type="number"
            />
            <Input title="Horário Inicial" name="inicio" type="time" />
            <Input title="Horário Final" name="fim" type="time" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            color="white"
            backgroundColor="primary"
            title="Salvar"
            icon="FaCheck"
          />
        </div>
      </form>
      <form className="p-10 rounded-2xl bg-white" onSubmit={handleSubmit}>
        <div>
          <Header className="grid gap-4">Faturamento</Header>
          <div className="py-5 flex flex-col xl:grid xl:grid-cols-4 gap-4">
            <Item span={4}>
              <Input title="Nome do Contratado" name="nomeContratado" />
            </Item>
            <Input title="Tipo de transação" name="tipoTransacao" />
            <Input
              title="Código prestador na operadora"
              name="codigoPrestadorNaOperadora"
            />
            <Input title="Registro ANS" name="registroANS" />
            <Input title="Versão Padrão" name="versaoPadrao" />
            <Input title="CNES" name="CNES" />
            <Input title="CNPJ" name="cnpj" />
            <InputFormat
              pattern="########"
              title="CEP"
              name="cep"
              onChange={debounceEvent(async value => {
                try {
                  const endereco = await consultarCep(value)
                  setFieldsValue({
                    ...endereco,
                    municipio: endereco.localidade,
                    codigoIbgeMunicipio: endereco.ibge
                  })
                  selectUFRef.current.setValue(
                    UF.filter(uf => uf.value === endereco.uf)
                  )
                } catch (err) {
                  console.log(err)
                }
              }, 1000)}
            />
            <SelectSearch
              title="Tipo de Logradouro"
              isClearable
              name="tipoLogradouro"
              setRef={ref => (selectTipoLogradouroRef.current = ref)}
              placeholder="Selecione!"
              options={tipoLogradouro}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
            <Input
              title="Logradouro"
              className="col-span-2"
              name="logradouro"
            />
            <Input title="Número" name="numero" />
            <Input title="Complemento" name="complemento" />
            <Input title="Municipio" name="municipio" />
            <SelectSearch
              title="UF"
              isClearable
              name="uf"
              setRef={ref => (selectUFRef.current = ref)}
              placeholder="Selecione!"
              options={UF}
              noOptionsMessage={() => 'Nenhum registro encontrado'}
              loadingMessage={() => 'Procurando...'}
            />
            <Input title="Código Ibge Municipio" name="codigoIbgeMunicipio" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            color="white"
            backgroundColor="primary"
            title="Salvar"
            icon="FaCheck"
          />
        </div>
      </form>
    </Menu>
  )
}

export async function getServerSideProps(ctx) {
  let configuracao = {}
  const payload = getCookie(ctx, 'payload')
  if (!payload) {
    return returnPage(ctx)
  }
  try {
    const { data } = await api.get('/configuracoes')
    if (data) {
      configuracao = data
    }
  } catch (err) {
    console.log(err)
  }

  return {
    props: {
      configuracao
    }
  }
}
