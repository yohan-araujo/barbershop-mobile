import {
  Avatar,
  Box,
  Text,
  VStack,
  Spacer,
  Divider,
  ScrollView,
  Center,
  HStack,
  Actionsheet,
  useDisclose,
  Pressable,
} from "native-base";
import { api } from "../../components/API";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import CardServico from "../../components/CardServico";
import CardProfissional from "../../components/CardProfissional";
import { ButtonEstilizado } from "../../components/ButtonEstilizado";
import Carrossel from "../../components/Carrosel";
import IServico from "../../@types/IServico";
import IProfissional from "../../@types/IProfissional";
import CardProfissionalHorizontal from "../../components/CardProfissionalHorizontal";
import HorarioSelecionavel from "../../components/HorarioSelecionavel";
import horarios from "../../assets/jsons/horarios.json";
import Calendario from "../../components/Calendario";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MensagemFeedback from "../../components/MensagemFeedback";
import ModalEstilizada from "../../components/ModalEstilizada";
import { ButtonAlternativo } from "../../components/ButtonAlternativo";
import CardServicoAlternativo from "../../components/CardServicoAlternativo";

export default function Agendamento({ navigation }) {
  const [numSecao, setNumSecao] = useState(0);
  const [servicos, setServicos] = useState<IServico[]>([]);
  const [profissionais, setProfissionais] = useState<IProfissional[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<string | null>(
    null
  );
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<
    string | null
  >(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null
  );
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [idCliente, setIdCliente] = useState("");
  const [mostrarFeedback, setMostrarFeedback] = useState(false); // Estado para controlar a exibição da mensagem
  const [tipoFeedback, setTipoFeedback] = useState<"sucesso" | "erro">(
    "sucesso"
  );
  const [mensagemFeedback, setMensagemFeedback] = useState("");
  const [cartaoFidelidade, setCartaoFidelidade] = useState(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [resgatavel, setResgatavel] = useState(false);
  const [fotoUsuario, setFotoUsuario] = useState("");

  const abrirModal = () => {
    setModalAberta(true);
  };

  const fecharModal = () => {
    setModalAberta(false);
  };

  const { isOpen, onOpen, onClose } = useDisclose();

  useEffect(() => {
    const fetchIdCliente = async () => {
      try {
        const id = await AsyncStorage.getItem("clienteId");
        setIdCliente(id);
      } catch (error) {
        console.error("Erro ao obter o id do cliente:", error);
      }
    };

    fetchIdCliente();
  }, []);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await api.get("/ser_servicos?ser_gratuito=false");
        setServicos(response.data);
      } catch (error) {
        console.log("Erro ao buscar servicos: ", error);
      }
    };

    fetchServicos();
  }, []);

  useEffect(() => {
    const fetchProfissionais = async () => {
      try {
        const response = await api.get("/pro_profissionais");
        const profissionaisData = response.data;

        const profissionaisCompletos = await Promise.all(
          profissionaisData.map(async (profissional: IProfissional) => {
            const usuarioResponse = await api.get(
              `/usu_usuarios/${profissional.usu_id}`
            );
            const usuarioCompleto = usuarioResponse.data;

            return { ...profissional, ...usuarioCompleto, id: profissional.id };
          })
        );

        setProfissionais(profissionaisCompletos);
      } catch (error) {
        console.log("Erro ao buscar profissionais: ", error);
      }
    };

    fetchProfissionais();
  }, []);

  const avancarSecao = () => {
    if (!servicoSelecionado || !profissionalSelecionado) {
      setTipoFeedback("erro");
      setMensagemFeedback("Selecione o profissional e o serviço!");
      setMostrarFeedback(true);
      return;
    }

    setNumSecao(numSecao + 1);
  };

  const voltarSecao = () => {
    if (numSecao > 0) {
      setNumSecao(numSecao - 1);
    } else {
      navigation.navigate("Login");
    }
  };

  const handleSelecionarServico = (id: string) => {
    if (!resgatavel) {
      setServicoSelecionado((servicoSelecionado) =>
        servicoSelecionado === id ? null : id
      );
    }
  };

  const handleSelecionarProfissional = (id: string) => {
    setProfissionalSelecionado((servicoSelecionado) =>
      servicoSelecionado === id ? null : id
    );
  };

  const servicoEscolhido = servicos.find(
    (servico) => servico.id === servicoSelecionado
  );

  const profissionalEscolhido = profissionais.find(
    (profissional) => profissional.id === profissionalSelecionado
  );

  const selecionarHorario = (horario: string) => {
    setHorarioSelecionado(horario);
  };

  const handleDataChange = (data: Date) => {
    const dataFormatada = format(new Date(data), "dd-MM-yyyy");
    setDataSelecionada(dataFormatada);
  };

  const agendar = async () => {
    if (!horarioSelecionado || !dataSelecionada) {
      setMensagemFeedback("Selecione um horário e uma data para prosseguir.");
      return;
    }

    const agendamento = {
      cli_id: idCliente,
      pro_id: profissionalSelecionado,
      ser_id: servicoSelecionado,
      age_data: dataSelecionada,
      age_hora: horarioSelecionado,
      age_status: false,
    };

    const agendamentoGratuito = {
      cli_id: idCliente,
      pro_id: profissionalSelecionado,
      ser_id: "5", // ID do serviço gratuito conforme seu banco de dados
      age_data: dataSelecionada,
      age_hora: horarioSelecionado,
      age_status: false,
    };

    try {
      const response = await api.post(
        "/age_agendamentos",
        resgatavel ? agendamentoGratuito : agendamento
      );

      if (response.status === 201) {
        setTipoFeedback("sucesso");
        if (!resgatavel) {
          setMensagemFeedback("Agendamento realizado.");
        } else {
          setMensagemFeedback("Agendamento realizado.");
          console.log("chegou aqui");
          // Após agendar gratuito, atualiza cf_pontos e cf_resgatavel
          try {
            const responseCliente = await api.patch(
              `/cf_cartaoFidelidade/${cartaoFidelidade.id}`,
              {
                cf_pontos: 0,
                cf_resgatavel: false,
              }
            );

            console.log(responseCliente);

            if (responseCliente.status === 200) {
              console.log(
                "Pontos do cliente zerados e resgatável setado para false."
              );
            } else {
              console.error("Erro ao atualizar cartão fidelidade do cliente.");
            }
          } catch (error) {
            console.error(
              "Erro ao atualizar cartão fidelidade do cliente:",
              error
            );
          }
          navigation.navigate("Perfil");
        }

        setMostrarFeedback(true);
      } else {
        console.error("Erro ao agendar: ", response.data);
        setTipoFeedback("erro");
        setMensagemFeedback("Erro ao agendar. Por favor, tente novamente.");
        setMostrarFeedback(true);
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      setTipoFeedback("erro");
      setMensagemFeedback("Erro ao agendar. Por favor, tente novamente.");
      setMostrarFeedback(true);
    }
  };

  useEffect(() => {
    const buscarCartaoFidelidade = async () => {
      console.log(idCliente);
      try {
        const response = await api.get(
          `/cf_cartaoFidelidade?cli_id=${idCliente}`
        );
        const cartao = response.data[0]; // Supondo que só existe um cartão de fidelidade por cliente

        if (cartao && cartao.cf_resgatavel) {
          // Se o cartão existe e é resgatável, mostrar a modal
          abrirModal();
          setResgatavel(true);
          // Ajuste para selecionar automaticamente o serviço com ID 5
          setServicoSelecionado("5");
        }

        setCartaoFidelidade(cartao); // Atualiza o estado com os dados do cartão
      } catch (error) {
        console.error("Erro ao buscar cartão de fidelidade:", error);
      }
    };

    buscarCartaoFidelidade();
  }, [idCliente]);

  console.log(cartaoFidelidade);

  useEffect(() => {
    const fetchFotoUsuario = async () => {
      try {
        const foto = await AsyncStorage.getItem("usuarioFoto");
        setFotoUsuario(foto);
      } catch (error) {
        console.error("Erro ao obter a foto do cliente:", error);
      }
    };

    fetchFotoUsuario();
  }, []);

  return (
    <ScrollView flex={1} p={5} backgroundColor={"#1D1D1D"}>
      <ModalEstilizada
        isOpen={modalAberta}
        onClose={fecharModal}
        titulo="Resgate disponível"
        conteudo="Você possui os pontos necessários para resgatar um serviço gratuito com o cartão fidelidade, quer resgatar agora?"
      />
      {numSecao >= 1 && (
        <VStack
          w={8}
          h={8}
          bg={"#E29C31"}
          rounded={"full"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <TouchableOpacity
            onPress={() => {
              voltarSecao();
            }}
          >
            <Ionicons name="arrow-back-outline" color="black" size={24} />
          </TouchableOpacity>
        </VStack>
      )}

      {numSecao === 0 && (
        <>
          <HStack flexDirection={"row"} mt={4}>
            <Box>
              <Text
                color={"#E29C31"}
                fontSize={28}
                textTransform={"uppercase"}
                fontFamily={"NeohellenicBold"}
              >
                Agendamento
              </Text>
              <Text
                color={"white"}
                fontSize={18}
                fontFamily={"NeohellenicRegular"}
              >
                Escolha seu serviço e profissional!
              </Text>
            </Box>
            <Spacer />
            <Box>
              <Avatar source={{ uri: fotoUsuario }} size={"lg"} />
            </Box>
          </HStack>

          <Divider mt={15} />

          {!resgatavel ? (
            <>
              <Text
                color={"#E29C31"}
                mt={4}
                fontSize={22}
                fontFamily={"NeohellenicBold"}
              >
                Serviços
              </Text>
              <Text
                color={"white"}
                fontSize={18}
                fontFamily={"NeohellenicRegular"}
              >
                Arraste para o lado e clique para selecionar o serviço!
              </Text>

              <Carrossel>
                {servicos.map((servico) => (
                  <CardServico
                    key={servico.id}
                    servico={servico}
                    onSelecionado={handleSelecionarServico}
                    estaSelecionado={servicoSelecionado === servico.id}
                  />
                ))}
              </Carrossel>
            </>
          ) : (
            <></>
          )}

          <Text
            color={"#E29C31"}
            mt={4}
            fontSize={22}
            fontFamily={"NeohellenicBold"}
          >
            Profissionais
          </Text>
          <Text color={"white"} fontSize={18} fontFamily={"NeohellenicRegular"}>
            Arraste para o lado e clique para selecionar o profissional!
          </Text>

          <Carrossel>
            {profissionais.map((profissional) => (
              <CardProfissional
                key={profissional.id}
                profissional={profissional}
                onSelecionado={handleSelecionarProfissional}
                estaSelecionado={profissionalSelecionado === profissional.id}
              />
            ))}
          </Carrossel>
          <Center mt={8}>
            <ButtonEstilizado
              texto="Próximo"
              mb={32}
              onPress={() => {
                avancarSecao();
              }}
            />
          </Center>
        </>
      )}
      {numSecao === 1 && (
        <VStack>
          <Text
            color={"#E29C31"}
            mt={4}
            fontSize={22}
            fontFamily={"NeohellenicBold"}
          >
            Suas escolhas:
          </Text>
          <Text color={"white"} fontSize={18} fontFamily={"NeohellenicRegular"}>
            Caso queira mudar clique em editar.
          </Text>
          <HStack justifyContent={"center"} alignItems={"center"} space={3}>
            {profissionalEscolhido && (
              <CardProfissionalHorizontal
                profissional={profissionalEscolhido}
                onSelecionado={handleSelecionarProfissional}
                estaSelecionado={true}
              />
            )}

            {servicoEscolhido && (
              <CardServicoAlternativo
                servico={servicoEscolhido}
                onSelecionado={handleSelecionarServico}
                estaSelecionado={true}
              />
            )}

            {resgatavel && (
              <CardServicoAlternativo
                servico={{
                  id: "5",
                  ser_icon: "iconTesoura.png",
                  ser_preco: 0,
                  ser_tipo: "Corte de cabelo",
                  ser_foto: "corteDeCabelo.jpg",
                }}
                onSelecionado={handleSelecionarServico}
                estaSelecionado={true}
              />
            )}
          </HStack>

          <Pressable onPress={() => voltarSecao()} mt={4} mr={3}>
            <Text
              color={"white"}
              fontFamily={"NeohellenicRegular"}
              fontSize={16}
              underline
              alignSelf={"flex-end"}
            >
              Editar
            </Text>
          </Pressable>
          <Text
            color={"#E29C31"}
            mt={4}
            fontSize={22}
            fontFamily={"NeohellenicBold"}
          >
            Escolha o dia:
          </Text>
          <Text color={"white"} fontSize={18} fontFamily={"NeohellenicRegular"}>
            Escolha o dia para o agendamento.
          </Text>
          <VStack mt={4}>
            <Calendario onDataChange={handleDataChange} />
          </VStack>

          <Text
            color={"#E29C31"}
            mt={8}
            fontSize={22}
            fontFamily={"NeohellenicBold"}
          >
            Escolha o horário:
          </Text>
          <Text color={"white"} fontSize={18} fontFamily={"NeohellenicRegular"}>
            Deslize e toque para escolher o horário.
          </Text>

          <Box mt={4}>
            <Carrossel>
              {horarios.map((horario) => (
                <HorarioSelecionavel
                  key={horario}
                  horario={horario}
                  selecionado={horario === horarioSelecionado}
                  aoSelecionado={() => selecionarHorario(horario)}
                />
              ))}
            </Carrossel>
          </Box>
          <Center mt={16} mb={32}>
            <ButtonEstilizado texto="Agendar" onPress={onOpen} />
          </Center>
        </VStack>
      )}

      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content
          bgColor={"#1d1d1d"}
          borderWidth={2}
          borderColor={"#E29C31"}
          borderBottomWidth={0}
          p={8}
        >
          <Text color={"#E29C31"} fontFamily={"NeohellenicBold"} fontSize={22}>
            Confirme seu agendamento:{" "}
          </Text>
          <Actionsheet.Item bgColor={"#1d1d1d"}>
            <Box>
              <Text
                color={"#E29C31"}
                fontFamily={"NeohellenicBold"}
                fontSize={18}
              >
                Dia e hora selecionados:
              </Text>
              <Text
                color={"white"}
                fontSize={18}
                fontFamily={"NeohellenicRegular"}
              >
                {dataSelecionada} - {horarioSelecionado}
              </Text>
            </Box>
          </Actionsheet.Item>

          <Divider bgColor={"#E29C31"} w={"90%"} />
          <Actionsheet.Item bgColor={"#1d1d1d"}>
            <Box>
              <Text
                color={"#E29C31"}
                fontFamily={"NeohellenicBold"}
                fontSize={18}
              >
                Serviço selecionado:
              </Text>
              {servicoEscolhido && (
                <Text
                  color={"white"}
                  fontSize={18}
                  fontFamily={"NeohellenicRegular"}
                >
                  {servicoEscolhido.ser_tipo} - Preço: R$
                  {servicoEscolhido.ser_preco.toFixed(2)}
                </Text>
              )}
              {resgatavel && (
                <Text
                  color={"white"}
                  fontSize={18}
                  fontFamily={"NeohellenicRegular"}
                >
                  Corte de cabelo - Gratuito
                </Text>
              )}
            </Box>
          </Actionsheet.Item>

          <Divider bgColor={"#E29C31"} w={"90%"} />
          <Actionsheet.Item bgColor={"#1d1d1d"}>
            <Box>
              <Text
                color={"#E29C31"}
                fontFamily={"NeohellenicBold"}
                fontSize={18}
              >
                Profissional selecionado:
              </Text>
              {profissionalEscolhido && (
                <Text
                  color={"white"}
                  fontSize={18}
                  fontFamily={"NeohellenicRegular"}
                >
                  {profissionalEscolhido.usu_nomeCompleto}
                </Text>
              )}
            </Box>
          </Actionsheet.Item>

          <Divider bgColor={"#E29C31"} w={"90%"} />
          <Actionsheet.Item bgColor={"#1d1d1d"}>
            <Box>
              <Text
                color={"#E29C31"}
                fontFamily={"NeohellenicBold"}
                fontSize={18}
              >
                Local do estabelecimento:
              </Text>

              <Text
                color={"white"}
                fontSize={18}
                fontFamily={"NeohellenicRegular"}
              >
                Rua: Benedito Morais N:110 Nova Guará
              </Text>
            </Box>
          </Actionsheet.Item>
          <Divider bgColor={"#E29C31"} w={"90%"} />
          <ButtonEstilizado texto="Confirmar" mt={6} onPress={agendar} />
          <ButtonAlternativo texto="Voltar" mt={3} onPress={onClose} />
        </Actionsheet.Content>
      </Actionsheet>
      {mostrarFeedback && (
        <MensagemFeedback
          tipo={tipoFeedback}
          mensagem={mensagemFeedback}
          isOpen={mostrarFeedback}
          onClose={() => setMostrarFeedback(false)}
        />
      )}
    </ScrollView>
  );
}
