import { Input, IInputProps, Text } from 'native-base';

interface InputProps extends IInputProps {
  placeholder?: string;
}

export function InputEstilizado({ placeholder, ...rest }: InputProps) {
  return (
    <>
      <Input
        variant={'rounded'}
        placeholder={placeholder}
        size="md"
        w="80%"
        bgColor="white"
        shadow={3}
        textAlign={'center'}
        {...rest}
      />
    </>
  );
}
