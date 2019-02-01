
import visualization from '../visualization.json';

const groupAccessor = controller.dataAccessors[visualization.variables[0].name];
const metricAccessor = controller.dataAccessors[visualization.variables[1].name];

const getTableRow = (label, value, color='') => `<div class="zd_tooltip_info_table_row"><div class="zd_tooltip_info_table_row_label">${label}</div><div class="zd_tooltip_info_table_row_value">${color} ${value}</div></div>`;

const getVolumeMetricTooltip = params => {
    if (_.get(params, 'data.datum.current.count')) {
        return `<div class="zd_tooltip_info_table_row">${getTableRow('Volume', params.data.datum.current.count)}</div>`;
    }
    return '';
}

 const getAccessorTooltip = params => {
     if (_.get(params, 'data.datum')) {
        const percentilFunctions = ['Min', 'Q1', 'Median', 'Q3', 'Max'];
        const metricName = metricAccessor.getLabel();
        return metricAccessor.formatted(params.data.datum).map((value, idx) => getTableRow(`${metricName} (${percentilFunctions[idx]})`, value)).join('');
     }
     return ''
 } 

/**
 * Format number to k, M, G (thousand, Million)
 * @param {Number} number 
 * @param {Number} digits 
 */
export const SIFormat = (number, digits=0) => {
    const codeTable = ['p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T'];
    const [exponentialNumber, exponential] = number.toExponential(digits).split('e');
    const index = Math.floor(_.parseInt(exponential) / 3);
    return exponentialNumber * Math.pow(10, _.parseInt(exponential) - index * 3) + codeTable[index + 4];
}

export const getFont = () => ({
    fontFamily: 'Source Pro, source-sans-pro, Helvetica, Arial, sans-serif',
    fontSize: '14',
});

export const getXAxisData = data => data.map(datum => _.first(datum.group));

export const getSeriesData = data => data.map(datum => {
    const color = controller.getColorAccessor().color(datum);
    return {
        value: metricAccessor.raw(datum),
        itemStyle: {
            color,
            borderColor: color,
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 0,
            }
        },
        datum,
    }
});

export const getMetricTooltip = params => {
    if (_.get(params, 'color') && _.get(params, 'data.datum') && _.get(params, 'value')) {
        // Access value directly from datum, because params.name can be empty when mouse move
        const color = `<div class="color_icon active" style="background-color: ${params.color};"></div>`;
        const volumeTooltip = getVolumeMetricTooltip(params);
        const metricTooltip = getAccessorTooltip(params);
        return `<div class="zd_tooltip_info_group customized"><div class="zd_tooltip_info_table"><div class="zd_tooltip_info_table_row">${getTableRow(groupAccessor.getLabel(), params.name, color)}</div>${volumeTooltip}${metricTooltip}</div></div>`;
    }
    return '';
};
