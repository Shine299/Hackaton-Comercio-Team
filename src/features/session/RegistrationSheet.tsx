import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Badge, BottomSheet, Button, Chip, Text, TextField } from '@/shared/ui';

import { useSessionStore } from './store';

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Escribe al menos 2 letras, por ejemplo: «Ana R.»')
    .max(30, 'Usa máximo 30 caracteres.'),
  consent: z
    .boolean()
    .refine((value) => value === true, { error: 'Para continuar, acepta cómo se muestran tus datos.' }),
});

type FormValues = z.input<typeof schema>;

type RegistrationSheetProps = {
  visible: boolean;
  /** Motivo en lenguaje claro: «Para publicar necesitamos que te registres». */
  reason: string;
  onClose: () => void;
  /** Se llama al terminar el registro (simulado). */
  onRegistered: () => void;
};

/**
 * Registro mínimo y simulado. Pide solo un nombre público y el consentimiento explícito
 * (minimización de datos). La verificación de identidad progresiva llega con el servidor.
 */
export function RegistrationSheet({ visible, reason, onClose, onRegistered }: RegistrationSheetProps) {
  const register = useSessionStore((s) => s.register);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', consent: false },
  });

  const submit = handleSubmit((values) => {
    register(values.displayName);
    onRegistered();
  });

  return (
    <BottomSheet
      visible={visible}
      title="Crea tu cuenta vecinal"
      onClose={onClose}
      footer={
        <>
          <Button label="Registrarme y continuar" size="lg" icon="check" onPress={() => void submit()} />
          <Button label="Ahora no" variant="ghost" onPress={onClose} />
        </>
      }>
      <Text tone="muted">{reason}</Text>
      <Badge label="Registro simulado en la demo" tone="warning" icon="flask-outline" />

      <Controller
        control={control}
        name="displayName"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextField
            label="Cómo te verán tus vecinos"
            hint="Nombre y la inicial del apellido. No pedimos teléfono ni dirección."
            placeholder="Ejemplo: Ana R."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.displayName?.message}
            autoCapitalize="words"
            maxLength={30}
          />
        )}
      />

      <Controller
        control={control}
        name="consent"
        render={({ field: { value, onChange } }) => (
          <View className="gap-1.5">
            <Chip
              label="Acepto que mi nombre y mi zona aproximada sean visibles"
              selected={value === true}
              onPress={() => onChange(value === true ? false : true)}
            />
            {errors.consent?.message ? (
              <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
                {errors.consent.message}
              </Text>
            ) : null}
          </View>
        )}
      />
    </BottomSheet>
  );
}
