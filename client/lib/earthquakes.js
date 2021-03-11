// /Users/kristinngodfrey/Library/Caches/typescript/4.1/node_modules/@types
// Þetta myndum við vilja geyma í umhverfi

export async function fetchEarthquakes(type, period) {
  let result;

  const url = new URL('/proxy', window.location);

  if (type) {
    url.searchParams.append('type', type);
  }
  if (period) {
    url.searchParams.append('period', period);
  }

  try {
    result = await fetch(url.href);
  } catch (e) {
    console.error(e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return data;
}
