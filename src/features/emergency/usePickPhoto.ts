import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

/** Foto opcional desde la galería, sin metadatos EXIF (evita filtrar coordenadas). */
export function usePickPhoto() {
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [hint, setHint] = useState<string | undefined>();

  const pick = async () => {
    setHint(undefined);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setHint('Sin acceso a la galería. Puedes enviar sin foto: no es indispensable.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      exif: false,
      allowsEditing: false,
    });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (uri) setPhotoUri(uri);
  };

  return { photoUri, hint, pick, clear: () => setPhotoUri(undefined) };
}
