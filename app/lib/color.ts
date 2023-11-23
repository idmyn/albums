import { createCanvas, loadImage } from "@napi-rs/canvas";
import { colord, Colord } from "colord";
import { Effect } from "effect";

class AverageColorError {
  readonly _tag = "AverageColorError";
}

// lifted from https://github.com/luukdv/color.js (MIT license)
export const average = (src: string) =>
  Effect.tryPromise({
    try: async () => {
      const img = await loadImage(src);
      const canvas = createCanvas(img.width, img.height);
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0);

      const { data } = context.getImageData(0, 0, img.width, img.height);

      const gap = 4 * 10;
      const amount = data.length / gap;
      const rgb = { r: 0, g: 0, b: 0 };

      for (let i = 0; i < data.length; i += gap) {
        rgb.r += data[i]!;
        rgb.g += data[i + 1]!;
        rgb.b += data[i + 2]!;
      }

      return colord({
        r: Math.round(rgb.r / amount),
        g: Math.round(rgb.g / amount),
        b: Math.round(rgb.b / amount),
      });
    },
    catch: () => new AverageColorError(),
  }).pipe(Effect.withSpan("calculateAverageColor"));

// Sorting

type RgbArray = readonly [number, number, number];
function colorDistance(color1: RgbArray, color2: RgbArray): number {
  const x =
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2);
  return Math.sqrt(x);
}

type HasColord = { color: Colord };
type HasColor = { color: Rgb };
type Rgb = { r: number; g: number; b: number };

const oneDimensionSorting = <T extends HasColord>(
  itemsWithColor: T[],
  dim: "h" | "s" | "l"
) => {
  return itemsWithColor.sort((left, right) => {
    if (left.color.toHsl()[dim] < right.color.toHsl()[dim]) {
      return -1;
    } else if (left.color.toHsl()[dim] > right.color.toHsl()[dim]) {
      return 1;
    } else {
      return 0;
    }
  });
};

type Cluster<T extends HasColord> = {
  name: string;
  leadColor: RgbArray;
  itemsWithColor: T[];
};

const sortWithClusters = <T extends HasColor>(itemsWithColor: T[]) => {
  const mappedItems = itemsWithColor.map((i) => ({
    ...i,
    color: colord(i.color),
  }));

  const clusters: Cluster<T & { color: Colord }>[] = [
    { name: "red", leadColor: [255, 0, 0], itemsWithColor: [] },
    { name: "orange", leadColor: [255, 128, 0], itemsWithColor: [] },
    { name: "yellow", leadColor: [255, 255, 0], itemsWithColor: [] },
    { name: "chartreuse", leadColor: [128, 255, 0], itemsWithColor: [] },
    { name: "green", leadColor: [0, 255, 0], itemsWithColor: [] },
    { name: "spring green", leadColor: [0, 255, 128], itemsWithColor: [] },
    { name: "cyan", leadColor: [0, 255, 255], itemsWithColor: [] },
    { name: "azure", leadColor: [0, 127, 255], itemsWithColor: [] },
    { name: "blue", leadColor: [0, 0, 255], itemsWithColor: [] },
    { name: "violet", leadColor: [127, 0, 255], itemsWithColor: [] },
    { name: "magenta", leadColor: [255, 0, 255], itemsWithColor: [] },
    { name: "rose", leadColor: [255, 0, 128], itemsWithColor: [] },
    { name: "black", leadColor: [0, 0, 0], itemsWithColor: [] },
    { name: "grey", leadColor: [235, 235, 235], itemsWithColor: [] },
    { name: "white", leadColor: [255, 255, 255], itemsWithColor: [] },
  ];

  mappedItems.forEach((item) => {
    let minDistance: number;
    let minDistanceClusterIndex = 0;

    clusters.forEach((cluster, clusterIndex) => {
      const { color } = item;
      const colorRgbArr = [
        color.toRgb().r,
        color.toRgb().g,
        color.toRgb().b,
      ] as const;
      const distance = colorDistance(colorRgbArr, cluster.leadColor);

      if (typeof minDistance === "undefined" || minDistance > distance) {
        minDistance = distance;
        minDistanceClusterIndex = clusterIndex;
      }
    });

    clusters[minDistanceClusterIndex].itemsWithColor.push(item);
  });

  clusters.forEach((cluster) => {
    const dim = ["white", "grey", "black"].includes(cluster.name) ? "l" : "s";
    cluster.itemsWithColor = oneDimensionSorting(cluster.itemsWithColor, dim);
  });

  return clusters;
};

export const sortByColor = <T extends HasColord>(_input: T[]) => {
  const input = _input.map((i) => ({ ...i, color: i.color.toRgb() }));
  const sortedClusters = sortWithClusters(input);
  return sortedClusters.flatMap((cluster) =>
    cluster.itemsWithColor.map((item) => ({
      ...item,
      color: item.color.toHex(),
    }))
  );
};
