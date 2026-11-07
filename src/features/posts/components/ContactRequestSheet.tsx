import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge, BottomSheet, Button, Text, TextField } from '@/shared/ui';

const schema = z.object({
  message: z
    .string()
    .trim()
    .min(8, 'Escribe al menos 8 caracteres para que tu vecino sepa cómo puedes coordinar.')
    .max(280, 'Máximo 280 caracteres.'),
});

type FormValues = z.input<typeof schema>;

type ContactRequestSheetProps = {
  visible: boolean;
  postTitle: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
};

/** Solicitud previa al chat: no abre mensajería; guarda el pedido en el teléfono. */
export function ContactRequestSheet({ visible, postTitle, onClose, onSubmit }: ContactRequestSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: '' },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values.message);
    reset();
  });

  return (
    <BottomSheet
      visible={visible}
      title="Pedir contacto"
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <Button label="Enviar solicitud" size="lg" icon="send" onPress={() => void submit()} />
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </>
      }>
      <Text tone="muted">
        Sobre «{postTitle}». El chat se abre cuando tu vecino acepte. En esta demo la solicitud queda en tu
        teléfono: aún no hay servidor ni mensajes reales.
      </Text>
      <Badge label="Solicitud simulada" tone="warning" icon="flask-outline" />
      <Controller
        control={control}
        name="message"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextField
            label="Mensaje corto"
            hint="Cuéntale en qué puedes ayudar o qué necesitas. No pidas teléfono ni dirección exacta."
            placeholder="Hola, vivo cerca y puedo pasar esta tarde."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.message?.message}
            multiline
            maxLength={280}
          />
        )}
      />
    </BottomSheet>
  );
}
