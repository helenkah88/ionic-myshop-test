export function convertToBase64({ photoUrl, format }) {
  return photoUrl.replace(`data:image/${format};base64,`, '');
}

export async function convertToBlob(file: string) {
  const res = await fetch(file);
  const blob = await res.blob();
  return blob;
}
