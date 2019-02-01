import echarts from 'echarts';
import { 
    getXAxisData, 
    getSeriesData,
    SIFormat,
    getFont,
    getMetricTooltip
 } from './utils';

import './index.css';

/**
 * Global controller object is described on Zoomdata knowledge base
 * @see https://www.zoomdata.com/developers/docs/custom-chart-api/controller/
 */

/* global controller */

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/creating-chart-container/
 */
const chartContainer = document.createElement('div');
chartContainer.classList.add('chart-container');
controller.element.appendChild(chartContainer);

echarts.registerProcessor(ecModel => {
    ecModel.findComponents({ mainType: 'yAxis' }).map(component => {
        const defaultSplitNumber = 5;
        const calculatedRatio = Math.floor(component.axis.grid.getRect().height / (defaultSplitNumber * component.getTextRect('0').height));
        const ratio = calculatedRatio > defaultSplitNumber ? defaultSplitNumber : calculatedRatio;

        if (ratio < 1) component.option.axisLabel.show = false;
        else {
            component.option.splitNumber = ratio;
            component.option.axisLabel.show = true;
        }
    });
})

const boxPlot = echarts.init(chartContainer);

const option = {
    grid: {
        left: 40,
        top: 30,
        right: 35,
        bottom: 30,
    },
    xAxis: {
        type: 'category',
        axisLabel: getFont(),
    },
    yAxis: {
        axisLabel: {
            ...getFont(),
            formatter: value => SIFormat(value, 2),
        }
    },
    series: {
        type: 'boxplot',
        emphasis: {
            itemStyle: {
                borderWidth: 1,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
            }
        },
    }

}

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/updating-queries-axis-labels/
 */
controller.createAxisLabel({
    picks: 'Group By',
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Group'
});

controller.createAxisLabel({
    picks: 'Metric',
    orientation: 'vertical',
    position: 'left'
});

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/receiving-chart-data/
 */
controller.update = data => {
    option.xAxis.data = getXAxisData(data);
    option.series.data = getSeriesData(data);
    boxPlot.setOption(option);
};

controller.resize = () => boxPlot.resize();

// Tooltip
boxPlot.on('mousemove', params => {
    if (_.has(params, 'data.datum') && _.isObject(params.data.datum)) {
        controller.tooltip.show({
            x: params.event.event.clientX,
            y: params.event.event.clientY,
            content: () => {
                return getMetricTooltip(params);
            }
        });
    }
});

boxPlot.on('mouseout', params => {
    controller.tooltip.hide();
});

// Menu bar
boxPlot.on('click', params => {
    if (_.has(params, 'data.datum') && _.isObject(params.data.datum)) {
        controller.tooltip.hide();
        controller.menu.show({
            x: params.event.event.clientX,
            y: params.event.event.clientY,
            data: () => params.data.datum,
        });
    }
});
