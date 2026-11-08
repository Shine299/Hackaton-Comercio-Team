import { classifyNeed, matchName, matchWakePhrase, parseConfirmation } from './phrases';

describe('matchWakePhrase (SPEC-052: «Yunta» + una palabra de ayuda)', () => {
  it('detecta la frase completa y sus variantes', () => {
    for (const text of [
      'Hola Yunta, ayúdame, me pasó algo',
      'hola yunta ayudame me paso algo',
      'Junta ayuda',
      'yunta auxilio',
      'Oye Yunta, socorro!',
      'Yunda, me caí',
      'yuta ayúdenme por favor',
    ]) {
      expect(matchWakePhrase(text)).toBe(true);
    }
  });

  it('no se dispara con una sola cosa (evita falsos avisos)', () => {
    for (const text of ['hola yunta', 'yunta', 'ayúdame', 'me caí', 'qué hora es', 'buenos días vecina', '']) {
      expect(matchWakePhrase(text)).toBe(false);
    }
  });

  it('no confunde palabras parecidas', () => {
    expect(matchWakePhrase('la ayudantía de ayer')).toBe(false);
    expect(matchWakePhrase('el conjunto es de yuntas de bueyes')).toBe(false);
  });
});

describe('classifyNeed', () => {
  it('fuego, humo y gas van a Bomberos', () => {
    for (const text of ['hay fuego', 'Incendio en la cocina', 'huele a gas', 'mucho humo']) {
      expect(classifyNeed(text)).toBe('fire');
    }
  });

  it('robo y violencia van a la Policía', () => {
    for (const text of ['me están robando', 'un ladrón entró', 'me persiguen', 'asalto']) {
      expect(classifyNeed(text)).toBe('police');
    }
  });

  it('todo lo demás va a la ambulancia (caídas, dolor, «me pasó algo»)', () => {
    for (const text of ['me caí', 'me pasó algo', 'me duele el pecho', 'hola yunta ayúdame', '']) {
      expect(classifyNeed(text)).toBe('ambulance');
    }
  });

  it('si hay fuego y una caída, gana Bomberos', () => {
    expect(classifyNeed('me caí y hay humo')).toBe('fire');
  });
});

describe('parseConfirmation', () => {
  it('«sí», «ayuda» y «no puedo moverme» confirman', () => {
    for (const text of ['sí', 'Si por favor', 'ayuda', 'necesito ayuda', 'no puedo moverme', 'no estoy bien', 'me duele mucho']) {
      expect(parseConfirmation(text)).toBe('yes');
    }
  });

  it('«no», «estoy bien» y «falsa alarma» cancelan', () => {
    for (const text of ['no', 'No, gracias', 'estoy bien', 'todo bien', 'falsa alarma', 'no necesito nada', 'cancelar', 'ya pasó']) {
      expect(parseConfirmation(text)).toBe('no');
    }
  });

  it('lo que no se entiende queda en «unknown»', () => {
    for (const text of ['', 'mmm', 'eh', '   ']) {
      expect(parseConfirmation(text)).toBe('unknown');
    }
  });
});

describe('matchName (SPEC-053: «Hola Yunta» abre la conversación)', () => {
  it('detecta el nombre con sus variantes', () => {
    for (const text of ['hola yunta', 'Hola, Yunta', 'Yunta, ¿qué hay hoy?', 'oye yunda', 'hola junta', 'Buenas junta']) {
      expect(matchName(text)).toBe(true);
    }
  });

  it('no se activa con la palabra «junta» de la conversación normal', () => {
    for (const text of ['la junta vecinal se reúne el sábado', 'junta directiva', 'buenos días vecina', '']) {
      expect(matchName(text)).toBe(false);
    }
  });
});
