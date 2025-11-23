import { useCallback } from "react";
import { useAppDispatch } from "@/redux/hook";
import { setCompressedImage, setPdfUri } from "../redux/slices/imageSlice";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import * as Print from "expo-print";

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

      const html = `
        <html>
          <body style="margin:0;padding:0;">
            <img src="${uriToUse}" style="width:100%;height:auto;" />
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      dispatch(setPdfUri(uri));
      return uri;
    },
    [compressImage, dispatch]
  );

  return { compressImage, convertToPdf };
};
