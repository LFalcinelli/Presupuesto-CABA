'use strict';

const homeExecutionLabels = ['Inicio', 'Marzo', 'Junio', 'Septiembre', 'Diciembre'];
const homeExecutionAxis = ['Inicio', 'Mar', 'Jun', 'Sep', 'Dic'];

function homeExecutionBalanceChart(series) {
 const values = series.flatMap(row => row.points.map(point => point.real / 1e12));
 const min = Math.min(0, Math.floor(Math.min(...values)));
 const max = Math.max(1, Math.ceil(Math.max(...values)));
 const x = index => 31 + index * 127;
 const y = value => 16 + (max - value) / (max - min) * 205;
 const ticks = Array.from({length: max - min + 1}, (_, i) => i + min);
 return `<svg class="home-execution-chart" viewBox="0 0 565 255" role="img" aria-labelledby="home-balance-svg-title home-balance-svg-desc">
  <title id="home-balance-svg-title">Saldo financiero acumulado por trimestre</title>
  <desc id="home-balance-svg-desc">Cuatro series desde 2023. La línea punteada de 2026 llega hasta septiembre. Los importes se pueden consultar con el selector y la tabla debajo del gráfico.</desc>
  ${ticks.map(value => `<line x1="31" x2="550" y1="${y(value)}" y2="${y(value)}" class="${value === 0 ? 'balance-zero' : 'balance-grid'}"/><text x="21" y="${y(value)}" text-anchor="end" dominant-baseline="central">${value}</text>`).join('')}
  ${homeExecutionAxis.map((label, i) => `<text class="balance-month" x="${x(i)}" y="246" text-anchor="${i === 0 ? 'start' : 'middle'}">${label}</text>`).join('')}
  <line x1="${x(3)}" x2="${x(3)}" y1="16" y2="221" class="balance-guide" data-home-balance-guide/>
  ${series.map((row, i) => {
   const points = [[x(0), y(0)], ...row.points.map(point => [x(point.quarter), y(point.real / 1e12)])];
   return `<g class="home-balance-series series-${i}">
    <polyline points="${points.map(point => point.join(',')).join(' ')}"/>
    ${points.slice(1).map(([cx, cy], index) => `<circle cx="${cx}" cy="${cy}" r="${index === 2 ? 6 : 4}" data-home-balance-point="${index + 1}" class="${index === 2 ? 'is-cut' : ''}"/>`).join('')}
   </g>`;
  }).join('')}
 </svg>`;
}

function homeBalanceCut(series, quarter) {
 return series.map((row, i) => {
  const point = row.points.find(point => point.quarter === quarter);
  return `<div class="series-${i}"><span><i aria-hidden="true"></i>${row.year}</span><strong>${point ? short(point.real) : 'Sin dato'}</strong></div>`;
 }).join('');
}

function homeExecutionChanges(data) {
 const {income, expense, balance, factor} = data.comparison;
 const items = [
  {name:'Ingresos', kind:'income', value:quarterDelta(income.current, income.previous, factor)},
  {name:'Gastos', kind:'expense', value:quarterDelta(expense.current, expense.previous, factor)}
 ];
 const limit = Math.max(2, Math.ceil(Math.max(...items.map(item => Math.abs(item.value)))));
 const now = fmt(balance.current / income.current * 100, 1);
 const before = fmt(balance.previous / income.previous * 100, 1);
 return `<article class="home-execution-card home-execution-change">
  <h2>Qué cambió en ingresos y gastos</h2>
  <p>Enero–septiembre ${data.year} frente al mismo período de ${data.year - 1}, descontando la inflación.</p>
  <figure aria-label="Variación real de ingresos y gastos">
   <div class="home-change-axis" aria-hidden="true"><span>−${limit}%</span><span>0</span><span>+${limit}%</span></div>
   ${items.map(({name, kind, value}) => `<div class="home-change-row change-${kind}">
    <div><span>${name}</span><strong>${signedPct(value)}</strong></div>
    <div class="home-change-track" aria-hidden="true"><i class="${value < 0 ? 'is-negative' : 'is-positive'}" style="--size:${Math.abs(value) / limit * 50}%"></i></div>
   </div>`).join('')}
  </figure>
  <p class="home-execution-insight">De cada $100 que entraron, quedaron <strong>$${now}</strong>. En ${data.year - 1} quedaban <strong>$${before}</strong>.</p>
  <button class="text-link home-components-toggle" type="button" data-home-components aria-controls="home-change-breakdown" aria-expanded="${Boolean(state.homeComponentsOpen)}">${state.homeComponentsOpen ? 'Ocultar el desglose ↑' : 'Ver los principales ingresos y gastos ↓'}</button>
  <div class="home-execution-links"><a href="${quarterLink('income')}">Ver ingresos →</a><a href="${quarterLink('home')}">Ver gastos →</a></div>
 </article>`;
}

function homeExecutionComponents(kind, data) {
 const incomeLabels = {'1.11': 'Impuestos', '1.14': 'Ventas y servicios'};
 const all = data.components[kind];
 const rows = all.slice(0, 5);
 const rest = all.slice(5);
 if (rest.length) rows.push({
  name: kind === 'income' ? 'Resto de ingresos' : 'Resto de gastos',
  current: rest.reduce((sum, row) => sum + row.current, 0),
  previous: rest.reduce((sum, row) => sum + row.previous, 0),
  components: rest.map(row => quarterName(row)).join(', ')
 });
 const total = data.comparison[kind].current;
 return `<section class="home-component-column change-${kind}">
  <h3>${kind === 'income' ? 'Ingresos' : 'Gastos'} · ${short(total)}</h3>
  <ul>${rows.map(row => {
   const variation = quarterDelta(row.current, row.previous, data.comparison.factor);
   const label = kind === 'income' ? incomeLabels[row.codes?.join('.')] || quarterName(row) : quarterName(row);
   return `<li>
    <div><span title="${E(row.components || row.name)}">${E(label)}</span><strong>${short(row.current)}</strong></div>
    <i class="home-component-track" aria-hidden="true"><b style="width:${row.current / total * 100}%"></b></i>
    <small>${signedPct(variation)} real frente a ${data.year - 1}</small>
   </li>`;
  }).join('')}</ul>
 </section>`;
}

function homeExecutionBreakdown(data) {
 return `<section id="home-change-breakdown" class="home-change-breakdown" aria-label="Desglose de ingresos y gastos"${state.homeComponentsOpen ? '' : ' hidden'}>
  <p>Montos de enero–septiembre ${data.year}. Las barras muestran cuánto pesa cada grupo. Los porcentajes comparan con ${data.year - 1}, descontando la inflación.</p>
  <div class="home-components-grid">${homeExecutionComponents('income', data)}${homeExecutionComponents('expense', data)}</div>
 </section>`;
}

function homeExecutionSources(data) {
 const realRows = data.series.flatMap(row => row.points.map(point => [
  row.year + ' · ' + homeExecutionLabels[point.quarter], money(point.nominal), money(point.real)
 ]));
 return `<details class="home-execution-sources"><summary>Datos, fuentes y cálculo</summary>
  <p>El saldo es lo que ingresó menos el gasto devengado, con intereses y sin financiamiento. Los datos son provisorios.</p>
  <p>En el primer gráfico ajustamos el saldo de cada trimestre con el IPCBA y luego sumamos los trimestres. En el segundo usamos el IPCBA promedio de enero a septiembre de cada año para comparar ingresos y gastos.</p>
  ${quarterTable(['Corte', 'Saldo en pesos del período', 'Saldo a precios de julio–septiembre 2026'], realRows, 'Saldos acumulados por trimestre')}
  ${quarterTable(['Concepto', 'Enero–septiembre 2025', 'Enero–septiembre 2026'], ['income','expense','balance'].map((key, i) => [['Ingresos','Gastos','Saldo'][i],money(data.comparison[key].previous),money(data.comparison[key].current)]), 'Totales originales en pesos de cada período')}
  <p>El margen compara enero–septiembre de cada año y divide el saldo financiero por los ingresos de ese período.</p>
  ${quarterTable(['Año', 'Ingresos enero–septiembre', 'Saldo financiero', 'Saldo por cada $100 de ingresos'], data.samePeriod.map(row => [row.year, money(row.income), money(row.financialResult), '$' + fmt(row.financialRatio, 1)]), 'Margen a septiembre · 2024–2026')}
  <ul><li><a href="${E(data.source)}">Informes de ejecución de Contaduría General</a></li><li><a href="${E(data.ipcSource)}">IPC de la Ciudad (IDECBA)</a></li><li><a href="${Site.url('data/fiscal-results/home-execution.json')}" download>Descargar los valores y la referencia de cada corte (JSON)</a></li></ul>
 </details>`;
}

function homeExecutionMarkup() {
 const data = state.homeExecution;
 const cut = data.quarter;
 return `<section class="home-execution" aria-labelledby="home-execution-title">
  <div class="home-execution-intro">
   <p class="home-execution-site">${E(state.content.home.hero.title)}</p>
   <h1 id="home-execution-title" tabindex="-1">Las cuentas de la Ciudad a septiembre</h1>
   <p>De enero a septiembre de ${data.year}, la Ciudad tuvo superávit: ingresó más de lo que gastó.</p>
   <a class="primary-btn" href="${quarterLink('summary')}">Explorá la ejecución 2026 →</a>
  </div>
  <div class="home-execution-grid">
   <article class="home-execution-card">
    <h2>El saldo a lo largo del año</h2>
    <p>Ingresos menos gastos, en billones de pesos de julio–septiembre de ${data.year}.</p>
    ${homeExecutionBalanceChart(data.series)}
    <label class="home-balance-control">Ver saldo al cierre de
     <select id="home-balance-quarter">${homeExecutionLabels.slice(1).map((label, i) => `<option value="${i + 1}"${i + 1 === cut ? ' selected' : ''}>${label}</option>`).join('')}</select>
    </label>
    <div class="home-balance-values" id="home-balance-values" aria-live="polite" aria-atomic="true">${homeBalanceCut(data.series, cut)}</div>
   </article>
   ${homeExecutionChanges(data)}
  </div>
  ${homeExecutionBreakdown(data)}
  ${homeExecutionSources(data)}
  ${homeSearchForm()}
 </section>`;
}

document.addEventListener('click', event => {
 const button = event.target.closest('[data-home-components]');
 if (!button) return;
 state.homeComponentsOpen = !state.homeComponentsOpen;
 document.getElementById('home-change-breakdown').hidden = !state.homeComponentsOpen;
 button.setAttribute('aria-expanded', String(state.homeComponentsOpen));
 button.textContent = state.homeComponentsOpen ? 'Ocultar el desglose ↑' : 'Ver los principales ingresos y gastos ↓';
});

document.addEventListener('change', event => {
 if (event.target.id !== 'home-balance-quarter') return;
 const quarter = Number(event.target.value);
 const section = event.target.closest('.home-execution');
 const guide = section.querySelector('[data-home-balance-guide]');
 const x = guide.closest('svg').querySelectorAll('.balance-month')[quarter].getAttribute('x');
 guide.setAttribute('x1', x);
 guide.setAttribute('x2', x);
 for (const point of section.querySelectorAll('[data-home-balance-point]')) {
  point.classList.toggle('is-cut', Number(point.dataset.homeBalancePoint) === quarter);
 }
 section.querySelector('#home-balance-values').innerHTML = homeBalanceCut(state.homeExecution.series, quarter);
});
