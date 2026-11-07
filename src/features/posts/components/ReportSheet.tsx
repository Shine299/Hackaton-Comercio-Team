import { useState } from 'react';
import { View } from 'react-native';

import { Badge, BottomSheet, Button, Chip, Text, TextField } from '@/shared/ui';

import { REPORT_REASONS, type ReportReasonId } from '../reportStore';

type ReportSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReasonId, note: string) => void;
};

/** Reporte local. No implica que alguien lo haya recibido ni revisado. */
export function ReportSheet({ visible, onClose, onSubmit }: ReportSheetProps) {
  const [reason, setReason] = useState<ReportReasonId | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();

  const close = () => {
    setReason(null);
    setNote('');
    setError(undefined);
    onClose();
  };

  const submit = () => {
    if (!reason) {
      setError('Elige un motivo para continuar.');
      return;
    }
    onSubmit(reason, note);
    close();
  };

  return (
    <BottomSheet
      visible={visible}
      title="Reportar publicación"
      onClose={close}
      footer={
        <>
          <Button label="Enviar reporte" size="lg" icon="flag-outline" variant="danger" onPress={submit} />
          <Button label="Cancelar" variant="ghost" onPress={close} />
        </>
      }>
      <Text tone="muted">
        El reporte se guarda en tu teléfono. Nadie lo recibe todavía: no hay equipo de moderación conectado.
      </Text>
      <Badge label="Reporte local, no enviado" tone="warning" icon="flask-outline" />

      <View className="gap-2">
        <Text variant="label-md" tone="muted">
          Motivo
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {REPORT_REASONS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              role="radio"
              selected={reason === item.id}
              onPress={() => {
                setReason(item.id);
                setError(undefined);
              }}
            />
          ))}
        </View>
        {error ? (
          <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>

      <TextField
        label="Detalle (opcional)"
        hint="No hace falta para enviar el reporte."
        placeholder="Qué viste y por qué te preocupa."
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={280}
      />
    </BottomSheet>
  );
}
