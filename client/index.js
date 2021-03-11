import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup, clearMarkers } from './lib/map';

async function quakes(type, period) {
  // "hleð gögnum"
  const loading = document.querySelector('.loading');
  if (loading.classList.contains('hidden')) {
    loading.classList.remove('hidden');
  }

  const earthquakes = await fetchEarthquakes(period, type);
  const eqTitle = earthquakes.data.metadata.title;
  const eqTime = earthquakes.info.elapsed;
  const eqCache = earthquakes.info.cache;
  const eqCacheBool = eqCache === true ? '' : 'ekki';

  // Fjarlægjum "hleð gögnum"
  loading.classList.add('hidden');

  if (!earthquakes) {
    loading.classList.add('Villa við að sækja gögn');
  }

  const h1 = document.querySelector('.h1');
  h1.innerHTML = '';
  const ul = document.querySelector('.earthquakes');
  ul.innerHTML = '';

  const cacheAndTime = document.querySelector('.cache');
  cacheAndTime.innerHTML = '';

  h1.append(eqTitle);
  cacheAndTime.append(`Gögn eru ${eqCacheBool} í cache. Fyrispurn tók ${eqTime} sek`);

  earthquakes.data.features.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const type = urlParams.has('type') ? urlParams.get('type') : 'all';
  const period = urlParams.has('period') ? urlParams.get('period') : 'hour';

  const map = document.querySelector('.map');
  init(map);

  const links = document.querySelectorAll('ul.nav a');

  links.forEach((link) => {
    const url = new URL(link.href);
    const { searchParams } = url;

    const linkPeriod = searchParams.get('period');
    const linkType = searchParams.get('type');

    link.addEventListener('click', (e) => {
      e.preventDefault();
      clearMarkers();
      quakes(linkType, linkPeriod);
    });
  });

  quakes(type, period);
});
