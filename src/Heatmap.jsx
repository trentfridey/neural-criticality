import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { interpolatePlasma } from 'd3-scale-chromatic';
import { BlockMath } from 'react-katex';

import {
  AxisBottom,
  AxisRight,
} from '@visx/axis';
import { HeatmapRect } from '@visx/heatmap';
import {
  scaleLinear,
  scaleQuantize,
} from '@visx/scale';

import {
  binaryStringToInt,
  genMessages,
  useNetworkState,
} from './propagate';

export default function Heatmap({ sigma, width, height, label, isRunning }) {
  const x = (d) => d.input;
  const y = (d) => d.output;
  const f = (d) => d.frequency;

  const nodes = 4;

  const {inputMessages, outputMessages} = genMessages(nodes);
  const loopId = useRef(null)
  const [results, setResults] = useState(() => {
    return inputMessages.reduce(
      (acc, input) => ({
        ...acc,
        [binaryStringToInt(input)]: outputMessages.reduce(
          (oacc, output) => ({
            ...oacc,
            [binaryStringToInt(output)]: 0,
          }),
          {}
        ),
      }),
      {}
    );
  });

  const { run } = useNetworkState(nodes, 6);

  const margin = {
    top: 20,
    left: 20,
    bottom: 40,
    right: 40,
  };

  const countOnes = a => a.toString(2).split('').filter(c => c === "1").length

  const xMax = width - margin.right;
  const yMax = height - margin.bottom;

  const data = Object.entries(results).map(([input, value]) => {
    return {
      input: Number.parseInt(input),
      bins: Object.entries(value).map(([output, frequency]) => ({
        output: Number.parseInt(output),
        frequency: frequency || 0,
      })).sort((a, b) => countOnes(a.output) - countOnes(b.output)),
    };
  }).sort((a,b) => countOnes(a.input) - countOnes(b.input));

  useEffect(() => {
    function simulate() {
      const result = run(
        inputMessages.at(Math.floor(Math.random() * inputMessages.length)),
        3,
        sigma
      );
      const input = binaryStringToInt(result.at(0).join(""));
      const output = binaryStringToInt(result.at(-1).join(""));
      setResults((results) => {
        const newResults = { ...results };
        newResults[input][output] += 1;
        return newResults;
      });
      loopId.current = setTimeout(simulate, 1)
    }
    if (isRunning) loopId.current = setTimeout(simulate, 100)
    if (!isRunning) {
      clearTimeout(loopId.current)
    }
  }, [isRunning]);

  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(x))],
    range: [margin.left, xMax],
  });

  const yScale = xScale;
  yScale.range([yMax, margin.top]);

  const colorScale = scaleQuantize({
    domain: [0, Math.max(...data.flatMap(d => d.bins.map(f)), 10)],
    range: Array.from({length: 15}, (x, i) => interpolatePlasma(i/14))
  });

  const bWidth = 10;

  const mutualInformation = useMemo(() => {
    let norm = 0;
    for (let input of inputMessages) {
      for (let output of outputMessages) {
        norm += results[binaryStringToInt(input)][binaryStringToInt(output)];
      }
    }
    const probXY = (x, y) => results[x][y] / norm;
    const probX = (x) =>
      outputMessages.reduce(
        (acc, curr) => acc + probXY(x, binaryStringToInt(curr)),
        0
      );
    const probY = (y) =>
      inputMessages.reduce(
        (acc, curr) => acc + probXY(binaryStringToInt(curr), y),
        0
      );
    let p = 0;
    let m = 0;
    for (let input of inputMessages) {
      const x = binaryStringToInt(input);
      if (probX(x) > 0) {
        for (let output of outputMessages) {
          const y = binaryStringToInt(output);
          if (probXY(x, y) > 0) {
            m +=
              -1 * probY(y) * Math.log2(probY(y)) +
              probXY(x, y) * Math.log2(probXY(x, y) / probX(x));
          }
        }
      }
    }
    return m / Math.pow(2, nodes);
  }, [results]);

  return (
    <div>
      <center>{label}</center>
      <svg height={height} width={width}>
        <HeatmapRect
          data={data}
          xScale={xScale}
          yScale={yScale}
          colorScale={colorScale}
          opacity={1}
          binWidth={bWidth}
          binHeight={bWidth}
          gap={3}
          count={f}
          stroke="black"
          strokeWidth={0.5}
        />
        <AxisBottom
          scale={xScale}
          orientation="bottom"
          fill="white"
          top={height - margin.top}
          label="input"
          labelProps={{ fill: "white", fontSize: 12, textAnchor: "middle" }}
          labelOffset={-20}
          tickValues={[]}
          hideAxisLine
          hideTicks
        />
        <AxisRight
          scale={yScale}
          orientation="right"
          left={width - margin.left}
          fill="white"
          label="output"
          labelProps={{ fill: "white", fontSize: 12, textAnchor: "middle" }}
          labelOffset={0}
          hideTicks
          hideAxisLine
          tickValues={[]}
        />
      </svg>
      <BlockMath>{`I(X;Y) = ${Math.max(mutualInformation, 0).toFixed(
        2
      )} ~ \\text{bits}`}</BlockMath>
    </div>
  );
}
