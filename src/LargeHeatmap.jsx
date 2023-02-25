import { interpolatePlasma } from 'd3-scale-chromatic';

import {
  AxisBottom,
  AxisRight,
} from '@visx/axis';
import { HeatmapRect } from '@visx/heatmap';
import { LegendLinear } from '@visx/legend';
import {
  scaleLinear,
  scaleQuantize,
} from '@visx/scale';

import data from './data.json';

export default function LargeHeatmap({ width, height, label }) {
  const x = (d) => d.input;
  const f = (d) => d.frequency;

  const margin = {
    top: 20,
    left: 20,
    bottom: 80,
    right: 40,
  };

  const xMax = width - margin.right;
  const yMax = height - margin.bottom;


  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(x))],
    range: [margin.left, xMax],
  });

  const yScale = xScale;
  yScale.range([yMax, margin.top]);
  console.log(yScale.ticks())
  
  const colorScale = scaleQuantize({
    domain: [0, Math.max(...data.flatMap(d => d.bins.map(f)), 10)],
    range: Array.from({length: 15}, (x, i) => interpolatePlasma(i/14))
  });

  return (
    <div style={{ margin: 'auto', width: '100%'}}>
      <center>{label}</center>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around'}}>
      <svg height={height} width={width}>
        <HeatmapRect
          data={data}
          xScale={xScale}
          yScale={yScale}
          colorScale={colorScale}
          opacity={1}
          count={f}
          stroke="black"
          binWidth={25}
          binHeight={25}
        />
        <AxisBottom
          scale={xScale}
          orientation="bottom"
          fill="white"
          top={height - 1.5*margin.top}
          left={margin.left}
          label="Input Message"
          labelProps={{ fill: "white", fontSize: 12, textAnchor: "middle" }}
          tickTransform={'translate(12)'}
          tickLabelProps={(value) => ({ fill: "white", fontSize: 12, dominantBaseline: 'middle', textAnchor: "middle", transform: `rotate(90 ${xScale(value)} 0)` })}
          labelOffset={-5}
          hideAxisLine
          tickValues={Array.from({ length: 15}, (x,i) => i)}
          tickFormat={(ticks, i) => [
            "0001",
            "0010",
            "0100",
            "1000",
            "0011",
            "0101",
            "0110",
            "1001",
            "1010",
            "1100",
            "0111",
            "1011",
            "1101",
            "1110",
            "1111"
          ][i]}
        />
        <AxisRight
          scale={yScale}
          orientation="right"
          left={width-margin.right}
          top={margin.top}
          fill="white"
          label="Output Message"
          labelProps={{ fill: "white", fontSize: 12, textAnchor: "middle" }}
          tickLabelProps={(value) => ({ fill: "white", fontSize: 12, textAnchor: "middle"})}
          hideAxisLine
          labelOffset={20}
          numTicks={15}
          tickFormat={(ticks, i) => [
            "0000",
            "0001",
            "0010",
            "0100",
            "1000",
            "0011",
            "0101",
            "0110",
            "1001",
            "1010",
            "1100",
            "0111",
            "1011",
            "1101",
            "1110",
            "1111"
          ][i]}
        />
      </svg>
        <LegendLinear
        scale={colorScale}
        direction="column-reverse"
        itemDirection="row-reverse"
        labelMargin="0 20px 0 0"
        shapeMargin="1px 0 0"
      />
      </div>
    </div>
  );
}
