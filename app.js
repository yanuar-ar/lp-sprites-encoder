const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { traits, traitSize } = require("./config");
const basePath = process.cwd();
const traitsDir = `${basePath}/traits`;

const getTraits = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((str, index) => {
      return {
        name: str.replace(/-/g, " ").replace(/.png/g, ""),
        fileName: str,
      };
    });
};

async function main() {
  let traitsData = [];

  traits.map((item, index) => {
    const traitList = getTraits(`${traitsDir}/${item}/`);

    // add attributeName
    traitList.map((data) => (data.attributeName = item));

    traitList.map((data) => traitsData.push(data));
  });

  // add id
  traitsData.map((data, index) => (data.id = index));

  const totalRows = ~~(traitsData.length / 3);
  const width = 3 * traitSize.width;
  const height = totalRows * traitSize.height;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  for (let rowIndex = 0; rowIndex <= totalRows; rowIndex++) {
    let remainingRows = traitsData.length - rowIndex * 3;

    if (remainingRows > 3) remainingRows = 3;

    for (let columnIndex = 1; columnIndex <= remainingRows; columnIndex++) {
      const index = rowIndex * 3 + columnIndex - 1;

      const { fileName, attributeName, id } = traitsData[index];
      const data = await loadImage(`${traitsDir}/${attributeName}/${fileName}`);

      ctx.drawImage(
        data,
        (columnIndex - 1) * traitSize.width,
        (rowIndex - 1) * traitSize.height,
        traitSize.width,
        traitSize.height,
      );
    }
  }

  // save to file
  fs.writeFileSync(`sprites.png`, canvas.toBuffer("image/png"));

  // generate base64
  fs.writeFileSync(`base64.txt`, canvas.toBuffer("image/png").toString("base64"));

  // generate traits list
  fs.writeFileSync("traits.json", JSON.stringify(traitsData));

  console.log(`finished with total ${traitsData.length} traits`);
}

main();
