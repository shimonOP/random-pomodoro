import { useEffect, useRef, memo } from "react";
import { ChartData, ChartOptions } from "chart.js/auto";
import Chart from "chart.js/auto";

type PieChartProps = {
  labels: string[];
  values: number[];
};

const MyPieChartComponent: React.FC<PieChartProps> = ({ labels, values }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ⭐ 型エラーにならない型定義（重要）
  const chartRef = useRef<Chart<"pie", number[], string> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 既存 destroy
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // ⭐ ChartData の型も "pie" を指定する
    const data: ChartData<"pie", number[], string> = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#FFB3C6", // やわらかいピンク
            "#BDE0FE", // パステル水色
            "#FFDFBA", // クリームオレンジ
            "#A3E4DB", // ミント
            "#CDB4DB", // 薄いラベンダー
            "#FDE2E4", // ベビーピンク
          ],
        },
      ],
    };

    const options: ChartOptions<"pie"> = {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    };

    // ⭐ Chart のジェネリクスを必ず <"pie", number[], string> にする
    chartRef.current = new Chart<"pie", number[], string>(canvasRef.current, {
      type: "pie",
      data,
      options,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, values]);

  return <canvas ref={canvasRef} />;
};

// React.memoでラップして、propsが変わらない限り再レンダリングを防ぐ
export const MyPieChart = memo(MyPieChartComponent, (prevProps, nextProps) => {
  // labelsとvaluesが同じ内容なら再レンダリングしない
  return (
    JSON.stringify(prevProps.labels) === JSON.stringify(nextProps.labels) &&
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values)
  );
});
