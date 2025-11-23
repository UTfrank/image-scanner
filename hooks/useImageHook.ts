import { useCallback } from "react";
import { useAppDispatch } from "@/redux/hook";
import { setCompressedImage, setPdfUri } from "../redux/slices/imageSlice";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import * as Print from "expo-print";
import { File } from "expo-file-system";

export const useImageTools = (context: ImageManipulator.ImageManipulatorContext | null) => {
  const dispatch = useAppDispatch();

  const compressImage = useCallback(
    async (options?: { width?: number; compress?: number }) => {
      if (!context) return null;

      const targetWidth = options?.width ?? 800;
      const quality = options?.compress ?? 0.1;

      context.resize({ width: targetWidth });
      const imageRef = await context.renderAsync();

      const result = await imageRef.saveAsync({
        compress: quality,
        format: SaveFormat.JPEG,
      });

      dispatch(setCompressedImage(result.uri));
      return result.uri;
    },
    [context, dispatch]
  );

  const convertToPdf = useCallback(
    async (imageUri?: string) => {
      const uriToUse = imageUri ?? (await compressImage());

      if (!uriToUse) return null;

      try {
        const file = new File(uriToUse);
        const base64 = await file.base64();

        const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
              }
              img {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="data:image/jpeg;base64,${base64}" />
          </body>
        </html>
      `;
  
        const { uri } = await Print.printToFileAsync({ html, width: 612,
          height: 792, useMarkupFormatter: true });
  
        dispatch(setPdfUri(uri));
        return uri;

      } catch (error) {
        console.error("Error converting to PDF:", error);
        return null;
      }

    },
    [compressImage, dispatch]
  );

  return { compressImage, convertToPdf };
};
