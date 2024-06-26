import React from "react";
import { Alert, Center, HStack, Slide, Text, IconButton } from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";

interface MensagemFeedbackProps {
  tipo: "sucesso" | "erro";
  mensagem: string;
  isOpen: boolean; // Adicionamos a propriedade isOpen para controlar externamente
  onClose: () => void; // Função para fechar a mensagem
}

export default function MensagemFeedback({
  tipo,
  mensagem,
  isOpen,
  onClose,
}: MensagemFeedbackProps) {
  // Definir cor de fundo, ícone e texto baseado no tipo
  const bgColor = tipo === "erro" ? "#FF0404" : "#34BF12";
  const iconName = tipo === "erro" ? "alert-circle" : "checkmark-circle";

  return (
    <Center>
      <Slide in={isOpen} placement="top">
        <Alert bgColor={bgColor} borderLeftWidth={4} borderColor="white">
          <HStack space={28} alignItems="center">
            <HStack space={2} alignItems="center">
              <Ionicons name={iconName} size={28} color="white" />
              <Text color="white" fontFamily="NeohellenicBold" fontSize={20}>
                {mensagem}
              </Text>
            </HStack>
            <IconButton
              icon={<Ionicons name="close" size={28} color="white" />}
              onPress={onClose}
            />
          </HStack>
        </Alert>
      </Slide>
    </Center>
  );
}
