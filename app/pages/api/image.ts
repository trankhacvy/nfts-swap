// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import nodeHtmlToImage from "node-html-to-image";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const imageUrl = req.query.imageUrl;
    const address = req.query.address;

    const assets = path.join(process.cwd(), "pages/api/_assets/");
    const output = path.join(process.cwd(), "public/output/");

    let fileContents = await fs.readFile(assets + "index.html", "utf8");
    fileContents = fileContents.replace("MY_IMAGE", imageUrl as string);

    await nodeHtmlToImage({
      output: path.join(output, `${address}.png`),
      html: fileContents,
    });

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500);
  }
}
