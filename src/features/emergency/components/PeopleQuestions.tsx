import { View } from 'react-native';

import { Text } from '@/shared/ui';

import { AT_RISK_OPTIONS, PEOPLE_COUNTS, type AtRisk, type PeopleCount } from '../types';

import { ChoiceTile } from './ChoiceTile';

type Props = {
  peopleCount?: PeopleCount;
  peopleAtRisk?: AtRisk;
  onChange: (next: { peopleCount?: PeopleCount; peopleAtRisk?: AtRisk }) => void;
};

/** Dos preguntas opcionales que ayudan a priorizar. Tocar la opción elegida otra vez la quita. */
export function PeopleQuestions({ peopleCount, peopleAtRisk, onChange }: Props) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text variant="headline-sm" accessibilityRole="header">
          ¿Cuántas personas?
        </Text>
        <View className="flex-row gap-2.5" accessibilityRole="radiogroup">
          {PEOPLE_COUNTS.map((item) => (
            <ChoiceTile
              key={item.id}
              layout="stack"
              icon={item.icon}
              title={item.label}
              selected={peopleCount === item.id}
              className="flex-1"
              onPress={() => onChange({ peopleCount: peopleCount === item.id ? undefined : item.id, peopleAtRisk })}
            />
          ))}
        </View>
      </View>
      <View className="gap-2">
        <Text variant="headline-sm" accessibilityRole="header">
          ¿Hay personas en riesgo?
        </Text>
        <View className="flex-row gap-2.5" accessibilityRole="radiogroup">
          {AT_RISK_OPTIONS.map((item) => (
            <ChoiceTile
              key={item.id}
              layout="stack"
              icon={item.icon}
              title={item.label}
              selected={peopleAtRisk === item.id}
              className="flex-1"
              onPress={() => onChange({ peopleCount, peopleAtRisk: peopleAtRisk === item.id ? undefined : item.id })}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
